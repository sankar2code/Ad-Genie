import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'userId query param is required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('saved_offers')
      .select('offer_id')
      .eq('user_id', userId);
    if (error) throw error;
    return NextResponse.json({ offerIds: (data || []).map(r => r.offer_id) });
  } catch (err) {
    console.error('GET /api/offers/save error:', err.message);
    return NextResponse.json({ offerIds: [], error: err.message }, { status: 200 });
  }
}

export async function POST(req) {
  try {
    const { userId, offerId } = await req.json();
    if (!userId || !offerId) {
      return NextResponse.json({ error: 'userId and offerId are required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('saved_offers')
      .upsert({ user_id: userId, offer_id: offerId }, { onConflict: 'user_id,offer_id' });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('POST /api/offers/save error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
