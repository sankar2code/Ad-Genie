import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const PHOTO_BUCKET = 'user-photos';
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
const SIGNED_URL_TTL = 60 * 60;

export async function POST(req) {
  try {
    const formData = await req.formData();
    const userId = formData.get('userId');
    const file = formData.get('photo');

    if (!userId || !file) {
      return NextResponse.json({ error: 'userId and photo are required' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPEG and PNG images are supported.' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Image must be under 5MB.' }, { status: 400 });
    }

    const ext = file.type === 'image/png' ? 'png' : 'jpg';
    const path = `${userId}/avatar.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin
      .storage
      .from(PHOTO_BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: true });
    if (uploadError) throw uploadError;

    const { error: upsertError } = await supabaseAdmin
      .from('user_photos')
      .upsert({ user_id: userId, storage_url: path, uploaded_at: new Date().toISOString() }, { onConflict: 'user_id' });
    if (upsertError) throw upsertError;

    const { data: signed } = await supabaseAdmin
      .storage
      .from(PHOTO_BUCKET)
      .createSignedUrl(path, SIGNED_URL_TTL);

    return NextResponse.json({ photoUrl: signed?.signedUrl || null });
  } catch (err) {
    console.error('POST /api/profile/photo error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId query param is required' }, { status: 400 });
    }

    const { data: photoRow } = await supabaseAdmin
      .from('user_photos')
      .select('storage_url')
      .eq('user_id', userId)
      .maybeSingle();

    if (photoRow?.storage_url) {
      await supabaseAdmin.storage.from(PHOTO_BUCKET).remove([photoRow.storage_url]);
    }

    const { error } = await supabaseAdmin
      .from('user_photos')
      .delete()
      .eq('user_id', userId);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/profile/photo error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
