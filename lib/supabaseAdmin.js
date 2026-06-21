import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey || serviceRoleKey.includes('your-supabase')) {
  console.warn('SUPABASE_SERVICE_ROLE_KEY not set. Server-side reads/writes to offers, redemptions, posters, hashtag_sets, etc. will fail until it is added to .env.');
}

// Server-only client — bypasses RLS. Never import this from a 'use client' component.
export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  serviceRoleKey || 'placeholder',
  { auth: { persistSession: false } },
);
