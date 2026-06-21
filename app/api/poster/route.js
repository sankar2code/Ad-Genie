import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { STORE_COLORS } from '@/lib/stores';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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
    console.error('Daily poster limit check failed, allowing request:', error.message);
    return { allowed: true, count: 0 };
  }
  return { allowed: (count || 0) < DAILY_FREE_LIMIT, count: count || 0 };
}

export async function POST(req) {
  try {
    const { offer, userId, userPhotoBase64 } = await req.json();

    if (userId) {
      const { allowed, count } = await checkDailyLimit(userId);
      if (!allowed) {
        return NextResponse.json(
          { error: `Daily poster limit reached (${count}/${DAILY_FREE_LIMIT}). Try again tomorrow.` },
          { status: 429 },
        );
      }
    }

    const discount = offer.discount_value || offer.discount;
    const brandColor = STORE_COLORS[offer.store?.toLowerCase()];

    const prompt = `Create a vibrant, eye-catching Instagram square poster (1080x1080px) for a retail promotion.
Store: ${offer.store}. Offer: ${offer.headline}. Discount: ${discount}.
${brandColor ? `Use ${offer.store}'s brand color (${brandColor}) as an accent.` : ''}
Display the offer headline and discount value in bold typography.
Style should feel energetic, modern, and social-media native.
Add a small "Made with Ad-Genie" watermark at the bottom.
${userPhotoBase64 ? 'Incorporate the provided user photo prominently with a circular crop, foreground centre-left.' : ''}`;

    const response = await openai.images.generate({
      model:   'gpt-image-1',
      prompt,
      n:       1,
      size:    '1024x1024',
    });

    const imageUrl = response.data[0].url;

    // NOTE: storing the OpenAI-hosted URL directly for now. OpenAI image URLs
    // expire — once the `generated-posters` Storage bucket exists (Phase 9),
    // download the image here and upload it to Supabase Storage instead,
    // storing that permanent path in `storage_url`.
    if (userId && offer.id) {
      const { error } = await supabaseAdmin
        .from('posters')
        .insert({ user_id: userId, offer_id: offer.id, storage_url: imageUrl });
      if (error) console.error('Failed to persist poster record:', error.message);
    }

    return NextResponse.json({ imageUrl });
  } catch (err) {
    console.error('Poster generation error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
