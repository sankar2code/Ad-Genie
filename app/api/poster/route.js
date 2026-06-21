/**
 * POST /api/poster
 *
 * Two-step poster generation:
 *   1. Azure AI Foundry agent (AZURE_POSTER_AGENT_ID) crafts an optimised Flux prompt
 *   2. FLUX-1.1-pro renders the image via Azure AI model inference endpoint
 *
 * Both steps use DefaultAzureCredential Bearer token — no API key required.
 *
 * Required env vars:
 *   AZURE_POSTER_AGENT_ID    UUID of the poster prompt agent in AI Foundry
 *   AZURE_AGENT_ENDPOINT_URL Foundry project endpoint
 *   AZURE_IMAGE_MODEL        Flux deployment name (default: FLUX-1.1-pro)
 */

import { NextResponse } from 'next/server';
import { runAgentQuery, runImageGeneration } from '@/lib/azure';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { STORE_COLORS } from '@/lib/stores';

const DAILY_FREE_LIMIT = 3;

async function checkDailyLimit(userId) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { count, error } = await supabaseAdmin
    .from('posters')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('generated_at', startOfDay.toISOString());

  if (error) {
    console.error('[poster] Daily limit check failed, allowing request:', error.message);
    return { allowed: true, count: 0 };
  }
  return { allowed: (count ?? 0) < DAILY_FREE_LIMIT, count: count ?? 0 };
}

/**
 * Ask the Foundry poster agent to craft an optimised Flux image prompt.
 * Falls back to a simple inline prompt if the agent call fails.
 */
async function buildImagePrompt(offer, brandColor, hasPhoto) {
  const posterAgentId = process.env.AZURE_POSTER_AGENT_ID;

  if (posterAgentId) {
    try {
      const agentInput = [
        `Store:        ${offer.store}`,
        `Headline:     ${offer.headline}`,
        `Discount:     ${offer.discount_value || offer.discount || 'Special offer'}`,
        `Category:     ${offer.category ?? 'General'}`,
        `Brand Color:  ${brandColor ?? ''}`,
        `Has Photo:    ${hasPhoto ? 'true' : 'false'}`,
      ].join('\n');

      const raw     = await runAgentQuery(agentInput, posterAgentId);
      const cleaned = raw.replace(/```json|```/g, '').trim();
      const parsed  = JSON.parse(cleaned);

      if (parsed?.prompt) return parsed.prompt;
    } catch (err) {
      console.warn('[poster] Poster agent failed, using fallback prompt:', err.message);
    }
  }

  // Fallback: build a specific, Flux-optimised prompt inline
  const discount  = offer.discount_value || offer.discount || 'Special offer';
  const storeName = offer.store.charAt(0).toUpperCase() + offer.store.slice(1);
  const category  = offer.category ?? '';

  return [
    `Instagram square promotional ad poster (1080x1080), professional retail advertising design.`,
    `Advertiser: ${storeName}.`,
    `Offer: "${offer.headline}".`,
    `Discount: ${discount}.`,
    category ? `Product category: ${category}.` : '',
    brandColor
      ? `Use ${storeName} brand color ${brandColor} as the dominant accent on buttons, borders, and highlights.`
      : '',
    `Large bold headline text showing the exact discount "${discount}" as the hero element.`,
    `Secondary text showing the offer description.`,
    `"Shop at ${storeName}" call-to-action badge.`,
    `Style: vibrant, high-contrast, social-media native, energetic retail ad.`,
    `Bottom watermark: "Made with Ad-Genie" in small grey text.`,
    hasPhoto ? `Circular-cropped user portrait photo placed prominently in the foreground.` : '',
    `No extra people, no copyright logos, clean professional layout.`,
  ].filter(Boolean).join(' ');
}

export async function POST(req) {
  try {
    const { offer, userId, userPhotoBase64 } = await req.json();
    if (!offer?.store || !offer?.headline) {
      return NextResponse.json({ error: 'offer.store and offer.headline are required.' }, { status: 400 });
    }

    // Daily rate-limit check (free tier: 3 posters/day)
    if (userId) {
      const { allowed, count } = await checkDailyLimit(userId);
      if (!allowed) {
        return NextResponse.json(
          { error: `Daily poster limit reached (${count}/${DAILY_FREE_LIMIT}). Try again tomorrow.` },
          { status: 429 },
        );
      }
    }

    const brandColor = STORE_COLORS[offer.store?.toLowerCase()];
    const hasPhoto   = Boolean(userPhotoBase64);

    // Step 1: Build the image prompt (via Foundry agent or inline fallback)
    const prompt = await buildImagePrompt(offer, brandColor, hasPhoto);
    console.log('[poster] Full prompt:', prompt);

    // Step 2: Call FLUX-1.1-pro via Azure AI model inference (Bearer token auth)
    const imageUrl = await runImageGeneration(prompt);

    // Persist poster record to Supabase
    if (userId && offer.id) {
      const { error } = await supabaseAdmin
        .from('posters')
        .insert({ user_id: userId, offer_id: offer.id, storage_url: imageUrl });
      if (error) console.error('[poster] Failed to persist poster record:', error.message);
    }

    return NextResponse.json({ imageUrl });
  } catch (err) {
    console.error('[poster] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
