import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    const { offer, userId } = await req.json();

    const discount = offer.discount_value || offer.discount;

    const prompt = `You are a social media strategist specialising in retail deal content.
Given the following offer details, generate 15-20 Instagram hashtags that maximise reach.
Mix 5 high-volume broad tags (#deals, #savemoney, #couponlife), 5 retailer-specific tags, and 5-10 product/category-specific tags.
Return only the hashtags as a JSON array of strings with # symbols. No explanations.

Offer: ${offer.store} — ${offer.headline} (${discount} off, category: ${offer.category})`;

    const completion = await openai.chat.completions.create({
      model:    'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    const hashtags = Array.isArray(parsed.hashtags) ? parsed.hashtags : Object.values(parsed)[0];

    let hashtagSetId = null;
    if (userId && offer.id) {
      const { data, error } = await supabaseAdmin
        .from('hashtag_sets')
        .insert({ user_id: userId, offer_id: offer.id, hashtags })
        .select('id')
        .single();
      if (error) console.error('Failed to persist hashtag set:', error.message);
      else hashtagSetId = data.id;
    }

    return NextResponse.json({ hashtags, hashtagSetId });
  } catch (err) {
    console.error('Hashtag generation error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
