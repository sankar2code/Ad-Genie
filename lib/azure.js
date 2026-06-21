/**
 * Azure AI Foundry — Agent client helper
 *
 * Auth: DefaultAzureCredential (requires `az login` once before starting the dev server)
 * API version: 2025-05-01 (only version supported by the Agents threads endpoint)
 *
 * Do NOT use API keys for this endpoint — the *.services.ai.azure.com/api/projects/* path
 * requires an Azure AD Bearer token. See Claude/knowledge/azure-endpoint.md for full details.
 *
 * Do NOT install @azure/openai here — this uses the Foundry Agents REST API directly.
 * Poster generation (image) uses a separate Azure OpenAI REST call in the poster route.
 */

import { DefaultAzureCredential } from '@azure/identity';

const credential = new DefaultAzureCredential();

// Scope for Azure AI Foundry Agent API (threads, runs, messages)
const AZURE_ML_SCOPE  = 'https://ml.azure.com/.default';
// Scope for Azure AI model inference — chat completions
const AZURE_COG_SCOPE = 'https://cognitiveservices.azure.com/.default';
// Scope for Azure AI image generation (FLUX via /openai/v1/)
const AZURE_AI_SCOPE  = 'https://ai.azure.com/.default';
const API_VERSION    = '2025-05-01';
const POLL_INTERVAL_MS = 1000;
const POLL_MAX_ATTEMPTS = 45; // 45 s timeout — poster prompts can be verbose

// ─── Token ───────────────────────────────────────────────────────────────────

async function getBearerToken(scope = AZURE_ML_SCOPE) {
  const tokenResponse = await credential.getToken(scope);
  if (!tokenResponse?.token) throw new Error('DefaultAzureCredential returned no token. Run `az login` first.');
  return tokenResponse.token;
}

function getEndpoint() {
  const url = process.env.AZURE_AGENT_ENDPOINT_URL;
  if (!url) throw new Error('AZURE_AGENT_ENDPOINT_URL is not set in .env.local');
  return url.replace(/\/$/, ''); // strip trailing slash
}

function resolveAgentId(override) {
  const id = override ?? process.env.AZURE_AGENT_ID;
  if (!id) throw new Error('No agent ID provided and AZURE_AGENT_ID is not set in .env.local');
  return id;
}

// ─── Foundry Model Inference — image generation ──────────────────────────────

/**
 * Generate an image via Azure AI Foundry model inference (e.g. FLUX-1.1-pro).
 * Uses Bearer token auth — no API key required.
 * Endpoint: {resource-base}/models/images/generations
 *
 * @param {string} prompt   Image generation prompt.
 * @param {string} [size]   Image size (default: 1024x1024).
 * @returns {Promise<string>}  URL or base64 string of the generated image.
 */
export async function runImageGeneration(prompt) {
  // Uses Pollinations.ai (free, no API key, Flux-powered).
  // To switch to Azure FLUX later, replace this function body with the Azure REST call.
  const encoded = encodeURIComponent(prompt);
  const url     = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&model=flux&nologo=true&seed=${Date.now()}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`[Pollinations] Image generation failed (${res.status})`);
  }

  // Response is the raw image bytes — convert to base64 data URL
  const buffer = await res.arrayBuffer();
  const b64    = Buffer.from(buffer).toString('base64');
  return `data:image/jpeg;base64,${b64}`;
}

// ─── Foundry Model Inference — direct chat completions ───────────────────────

/**
 * Call the Azure AI Foundry model inference endpoint for chat completions.
 * Uses the same Bearer token as the agent API — no API key required.
 *
 * Model is configured via AZURE_FOUNDRY_MODEL env var (default: grok-4.3).
 *
 * @param {Array<{role: string, content: string}>} messages  Chat messages array.
 * @returns {Promise<string>}  The assistant's text response.
 */
export async function runChatQuery(messages) {
  const token        = await getBearerToken(AZURE_AI_SCOPE);
  const endpoint     = getEndpoint();
  const resourceBase = endpoint.split('/api/projects')[0];
  const model        = process.env.AZURE_FOUNDRY_MODEL ?? 'grok-4.3';

  const res = await fetch(
    `${resourceBase}/openai/v1/chat/completions`,
    {
      method: 'POST',
      headers: {
        Authorization:  `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, messages, temperature: 0.7, max_tokens: 600 }),
    },
  );

  if (!res.ok) {
    throw new Error(`[Azure Foundry] Chat inference failed (${res.status}): ${await res.text()}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

// ─── Foundry Agent — thread / run / poll ─────────────────────────────────────

/**
 * Run a single-turn query through the Azure AI Foundry agent.
 *
 * @param {string} userMessage        The prompt to send as the user message.
 * @param {string} [agentId]          Optional agent ID override (e.g. AZURE_POSTER_AGENT_ID).
 *                                    Falls back to AZURE_AGENT_ID env var when omitted.
 * @returns {Promise<string>}         The assistant's text response.
 */
export async function runAgentQuery(userMessage, agentId) {
  const [token, endpoint, resolvedAgentId] = await Promise.all([
    getBearerToken(),
    Promise.resolve(getEndpoint()),
    Promise.resolve(resolveAgentId(agentId)),
  ]);

  const headers = {
    Authorization:  `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // 1. Create an empty thread
  const threadRes = await fetch(`${endpoint}/threads?api-version=${API_VERSION}`, {
    method: 'POST', headers, body: JSON.stringify({}),
  });
  if (!threadRes.ok) {
    throw new Error(`[Azure] Create thread failed (${threadRes.status}): ${await threadRes.text()}`);
  }
  const { id: threadId } = await threadRes.json();

  // 2. Add the user message to the thread
  const msgRes = await fetch(
    `${endpoint}/threads/${threadId}/messages?api-version=${API_VERSION}`,
    { method: 'POST', headers, body: JSON.stringify({ role: 'user', content: userMessage }) },
  );
  if (!msgRes.ok) {
    throw new Error(`[Azure] Add message failed (${msgRes.status}): ${await msgRes.text()}`);
  }

  // 3. Start a run against the agent
  const runRes = await fetch(
    `${endpoint}/threads/${threadId}/runs?api-version=${API_VERSION}`,
    { method: 'POST', headers, body: JSON.stringify({ assistant_id: resolvedAgentId }) },
  );
  if (!runRes.ok) {
    throw new Error(`[Azure] Start run failed (${runRes.status}): ${await runRes.text()}`);
  }
  const { id: runId } = await runRes.json();

  // 4. Poll until terminal state
  const TERMINAL = new Set(['completed', 'failed', 'cancelled', 'expired']);
  let status = 'queued';
  let attempts = 0;

  while (!TERMINAL.has(status)) {
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
    if (++attempts > POLL_MAX_ATTEMPTS) {
      throw new Error(`[Azure] Run timed out after ${POLL_MAX_ATTEMPTS}s (threadId=${threadId}, runId=${runId})`);
    }
    const pollRes = await fetch(
      `${endpoint}/threads/${threadId}/runs/${runId}?api-version=${API_VERSION}`,
      { headers },
    );
    if (!pollRes.ok) {
      throw new Error(`[Azure] Poll run failed (${pollRes.status}): ${await pollRes.text()}`);
    }
    status = (await pollRes.json()).status;
  }

  if (status !== 'completed') {
    throw new Error(`[Azure] Run ended with status "${status}" — check Azure AI Foundry logs.`);
  }

  // 5. Retrieve messages and extract the assistant's latest text reply
  const msgsRes = await fetch(
    `${endpoint}/threads/${threadId}/messages?api-version=${API_VERSION}`,
    { headers },
  );
  if (!msgsRes.ok) {
    throw new Error(`[Azure] Get messages failed (${msgsRes.status}): ${await msgsRes.text()}`);
  }
  const { data: messages } = await msgsRes.json();

  // Messages are newest-first; find the first assistant message
  const assistantMsg = messages.find(m => m.role === 'assistant');
  if (!assistantMsg) throw new Error('[Azure] No assistant message found in thread response.');

  const textContent = assistantMsg.content?.find(c => c.type === 'text')?.text?.value ?? '';
  return textContent;
}
