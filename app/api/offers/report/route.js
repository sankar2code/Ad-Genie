import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req) {
  try {
    const { userId, offerId, reason, details } = await req.json();
    if (!offerId || !reason) {
      return NextResponse.json({ error: 'offerId and reason are required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('reported_issues')
      .insert({ user_id: userId || null, offer_id: offerId, reason, details: details || null });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('POST /api/offers/report error:', err.message);
    // Don't block the user on a logging failure — the report UI should
    // still confirm submission even if persistence isn't set up yet.
    return NextResponse.json({ success: false, error: err.message }, { status: 200 });
  }
}
