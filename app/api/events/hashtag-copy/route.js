import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req) {
  try {
    const { userId, hashtagSetId } = await req.json();
    if (!userId || !hashtagSetId) {
      return NextResponse.json({ error: 'userId and hashtagSetId are required' }, { status: 400 });
    }

    const { error: insertError } = await supabaseAdmin
      .from('hashtag_copy_events')
      .insert({ user_id: userId, hashtag_set_id: hashtagSetId });
    if (insertError) throw insertError;

    const { error: updateError } = await supabaseAdmin
      .from('hashtag_sets')
      .update({ copied_at: new Date().toISOString() })
      .eq('id', hashtagSetId)
      .is('copied_at', null);
    if (updateError) console.error('Failed to set hashtag_sets.copied_at:', updateError.message);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('POST /api/events/hashtag-copy error:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 200 });
  }
}
