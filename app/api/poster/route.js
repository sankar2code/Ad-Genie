/**
 * POST /api/poster
 *
 * Generates an AI ad poster via Azure OpenAI image generation REST API.
 *
 * Uses a separate Azure OpenAI resource endpoint (not the Foundry Agents endpoint)
 * authenticated with an API key — no Bearer token required for this call.
 *
 * Required env vars:
 *   AZURE_OPENAI_ENDPOINT          e.g. https://<resource>.openai.azure.com
 *   AZURE_OPENAI_API_KEY           resource-level API key from Azure Portal
 *   AZURE_OPENAI_IMAGE_DEPLOYMENT  deployment name (e.g. "dall-e-3" or "gpt-image-1")
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { STORE_COLORS } from '@/lib/stores';

const DAILY_FREE_LIMIT    = 3;
const IMAGE_API_VERSION   = '2024-05-01-preview';

function getAzureImageEndpoint() {
  const base       = process.env.AZURE_OPENAI_ENDPOINT?.replace(/\/$/, '');
  const deployment = process.env.AZURE_OPENAI_IMAGE_DEPLOYMENT;
  const apiKey     = process.env.AZURE_OPENAI_API_KEY;

  if (!base || !deployment || !apiKey) {
    throw new Error(
      'Missing Azure OpenAI config. Set AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_IMAGE_DEPLOYMENT, and AZURE_OPENAI_API_KEY in .env.local'
    );
  }
  const url = `${base}/openai/deployments/${deployment}/images/generations?api-version=${IMAGE_API_VERSION}`;
  return { url, apiKey };
}

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

    const discount   = offer.discount_value || offer.discount || 'discount';
    const brandColor = STORE_COLORS[offer.store?.toLowerCase()];

    const prompt = `Create a vibrant, eye-catching Instagram square poster (1080×1080px) for a retail promotion.
Store: ${offer.store}. Offer: ${offer.headline}. Discount: ${discount}.
${brandColor ? `Use ${offer.store}'s brand color (${brandColor}) as the dominant accent.` : ''}
Display the offer headline and discount value in bold typography.
Style should feel energetic, modern, and social-media native.
Add a small "Made with Ad-Genie" watermark at the bottom.
${userPhotoBase64 ? 'Incorporate the provided user photo prominently with a circular crop, foreground centre-left.' : ''}`;

    // Call Azure OpenAI image generation REST API
    const { url: azureUrl, apiKey } = getAzureImageEndpoint();

    const azureRes = await fetch(azureUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        prompt,
        n:    1,
        size: '1024x1024',
        // If your deployment supports response_format, set to 'url' (default) or 'b64_json'
      }),
    });

    if (!azureRes.ok) {
      const errBody = await azureRes.text();
      throw new Error(`[Azure OpenAI] Image generation failed (${azureRes.status}): ${errBody}`);
    }

    const azureData = await azureRes.json();
    const imageUrl  = azureData.data?.[0]?.url;

    if (!imageUrl) {
      throw new Error('[Azure OpenAI] Response contained no image URL.');
    }

    // Persist poster record to Supabase
    // NOTE: Azure OpenAI image URLs expire. Once the `generated-posters` Storage bucket
    // is configured (Phase 9 in app-plan.md), download the image here and upload to
    // Supabase Storage, then store that permanent URL instead.
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
