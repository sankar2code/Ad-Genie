import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function DELETE(req, { params }) {
  try {
    const { id } = params; // offer id
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId query param is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('saved_offers')
      .delete()
      .eq('user_id', userId)
      .eq('offer_id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/offers/save/[id] error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
