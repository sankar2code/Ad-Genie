import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

function parseSavingsAmount(discountValue) {
  if (!discountValue) return null;
  const match = String(discountValue).match(/[\d.]+/);
  if (!match) return null;
  const num = parseFloat(match[0]);
  return Number.isNaN(num) ? null : num;
}

export async function POST(req) {
  try {
    const { userId, offerId, channel, discountValue } = await req.json();

    if (!userId || !offerId || !['online', 'offline'].includes(channel)) {
      return NextResponse.json({ error: 'userId, offerId, and a valid channel are required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('redemptions')
      .insert({
        user_id: userId,
        offer_id: offerId,
        channel,
        savings_amount: parseSavingsAmount(discountValue),
      })
      .select('id')
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, redemptionId: data.id });
  } catch (err) {
    console.error('POST /api/redemptions error:', err.message);
    // Don't block the user's redemption flow on a logging failure.
    return NextResponse.json({ success: false, error: err.message }, { status: 200 });
  }
}
