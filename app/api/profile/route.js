import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const PHOTO_BUCKET = 'user-photos';
const SIGNED_URL_TTL = 60 * 60; // 1 hour

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'userId query param is required' }, { status: 400 });
  }

  try {
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('display_name, email, zip_code, favourite_stores, notification_prefs')
      .eq('id', userId)
      .single();
    if (userError) throw userError;

    const { data: photoRow } = await supabaseAdmin
      .from('user_photos')
      .select('storage_url')
      .eq('user_id', userId)
      .maybeSingle();

    let photoUrl = null;
    if (photoRow?.storage_url) {
      const { data: signed } = await supabaseAdmin
        .storage
        .from(PHOTO_BUCKET)
        .createSignedUrl(photoRow.storage_url, SIGNED_URL_TTL);
      photoUrl = signed?.signedUrl || null;
    }

    return NextResponse.json({
      displayName: user.display_name,
      email: user.email,
      zipCode: user.zip_code,
      favouriteStores: user.favourite_stores || [],
      notificationPrefs: user.notification_prefs || { dealAlerts: true, expiryReminders: true },
      photoUrl,
    });
  } catch (err) {
    console.error('GET /api/profile error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { userId, displayName, zipCode, favouriteStores, notificationPrefs } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const updates = {};
    if (displayName !== undefined) updates.display_name = displayName;
    if (zipCode !== undefined) updates.zip_code = zipCode;
    if (favouriteStores !== undefined) updates.favourite_stores = favouriteStores;
    if (notificationPrefs !== undefined) updates.notification_prefs = notificationPrefs;
    // email is never accepted here — it's the login identifier and read-only.

    const { error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('PATCH /api/profile error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
