import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req) {
  try {
    const { userId, offerId } = await req.json();
    if (!userId || !offerId) {
      return NextResponse.json({ error: 'userId and offerId are required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('download_events')
      .insert({ user_id: userId, offer_id: offerId });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('POST /api/events/download error:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 200 });
  }
}
