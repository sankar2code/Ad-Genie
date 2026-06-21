import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getMockOffer } from '@/lib/mockOffers';

export async function GET(req, { params }) {
  const { id } = params;

  try {
    const { data, error } = await supabaseAdmin
      .from('offers')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && data) {
      return NextResponse.json({ offer: data });
    }
  } catch (err) {
    console.error('GET /api/offers/[id] error:', err.message);
  }

  const mock = getMockOffer(id);
  if (mock) return NextResponse.json({ offer: mock });

  return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
}
