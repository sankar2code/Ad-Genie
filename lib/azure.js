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

// Scope required for Azure AI Foundry Agent API calls
const AZURE_ML_SCOPE = 'https://ml.azure.com/.default';
const API_VERSION    = '2025-05-01';
const POLL_INTERVAL_MS = 1000;
const POLL_MAX_ATTEMPTS = 45; // 45 s timeout — poster prompts can be verbose

// ─── Token ───────────────────────────────────────────────────────────────────

async function getBearerToken() {
  const tokenResponse = await credential.getToken(AZURE_ML_SCOPE);
  if (!tokenResponse?.token) throw new Error('DefaultAzureCredential returned no token. Run `az login` first.');
  return tokenResponse.token;
}

function getEndpoint() {
  const url = process.env.AZURE_AGENT_ENDPOINT_URL;
  if (!url) throw new Error('AZURE_AGENT_ENDPOINT_URL is not set in .env.local');
  return url.replace(/\/$/, ''); // strip trailing slash
}

function getAgentId() {
  const id = process.env.AZURE_AGENT_ID;
  if (!id) throw new Error('AZURE_AGENT_ID is not set in .env.local');
  if (!id.startsWith('asst_')) throw new Error(`AZURE_AGENT_ID must start with "asst_" — got "${id}". Copy the ID from Azure AI Foundry → Agents, not the display name.`);
  return id;
}

// ─── Foundry Agent — thread / run / poll ─────────────────────────────────────

/**
 * Run a single-turn query through the Azure AI Foundry agent.
 *
 * @param {string} userMessage   The prompt to send as the user message.
 * @returns {Promise<string>}    The assistant's text response.
 */
export async function runAgentQuery(userMessage) {
  const [token, endpoint, agentId] = await Promise.all([
    getBearerToken(),
    Promise.resolve(getEndpoint()),
    Promise.resolve(getAgentId()),
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
    { method: 'POST', headers, body: JSON.stringify({ assistant_id: agentId }) },
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
