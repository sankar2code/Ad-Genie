/**
 * POST /api/hashtags
 *
 * Generates 15-20 Instagram hashtags for a given offer using Azure AI Foundry
 * model inference (Grok-4.3). Uses DefaultAzureCredential Bearer token —
 * same auth as the poster agent. No separate API key required.
 *
 * Required env vars:
 *   AZURE_AGENT_ENDPOINT_URL  Foundry project endpoint
 *   AZURE_FOUNDRY_MODEL       Model name (default: grok-4.3)
 */

import { NextResponse } from 'next/server';
import { runChatQuery } from '@/lib/azure';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req) {
  try {
    const { offer, userId } = await req.json();
    if (!offer?.store || !offer?.headline) {
      return NextResponse.json({ error: 'offer.store and offer.headline are required.' }, { status: 400 });
    }

    const discount = offer.discount_value || offer.discount || 'discount';

    const messages = [
      {
        role: 'system',
        content: `You are a social media strategist specialising in retail deal content for Instagram.
When given offer details, generate 15-20 Instagram hashtags that maximise organic reach.
Mix:
  - 5 high-volume broad tags (#deals, #savemoney, #couponlife, etc.)
  - 5 retailer-specific tags (#${offer.store.replace(/\s/g, '')}Deals, etc.)
  - 5-10 product/category-specific tags
Return ONLY a valid JSON object with this exact shape — no markdown fences, no explanations:
{"hashtags": ["#tag1", "#tag2", ...]}`,
      },
      {
        role: 'user',
        content: `Offer details:
  Store:    ${offer.store}
  Headline: ${offer.headline}
  Discount: ${discount}
  Category: ${offer.category ?? 'General'}`,
      },
    ];

    const raw = await runChatQuery(messages);

    // Parse JSON; fall back to regex extraction if model wraps in markdown
    let hashtags;
    try {
      const cleaned = raw.replace(/```json|```/g, '').trim();
      const parsed  = JSON.parse(cleaned);
      hashtags = Array.isArray(parsed.hashtags)
        ? parsed.hashtags
        : Object.values(parsed)[0];
    } catch {
      hashtags = raw.match(/#\w+/g) ?? [];
    }

    if (!hashtags.length) {
      return NextResponse.json({ error: 'Model returned no hashtags.' }, { status: 502 });
    }

    // Persist to Supabase
    let hashtagSetId = null;
    if (userId && offer.id) {
      const { data, error } = await supabaseAdmin
        .from('hashtag_sets')
        .insert({ user_id: userId, offer_id: offer.id, hashtags })
        .select('id')
        .single();
      if (error) console.error('[hashtags] Failed to persist hashtag set:', error.message);
      else hashtagSetId = data.id;
    }

    return NextResponse.json({ hashtags, hashtagSetId });
  } catch (err) {
    console.error('[hashtags] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
