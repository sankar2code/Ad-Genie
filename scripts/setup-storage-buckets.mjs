// One-time setup script: creates the two private Supabase Storage buckets
// this app needs (see specs/database.md "Storage Buckets"). Requires a real
// SUPABASE_SERVICE_ROLE_KEY in .env — bucket creation needs admin privileges,
// the anon key cannot do this.
//
// Run with: node scripts/setup-storage-buckets.mjs

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey || serviceRoleKey.includes('your-supabase')) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and a real SUPABASE_SERVICE_ROLE_KEY in .env first.');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey);

const BUCKETS = ['user-photos', 'generated-posters'];

for (const name of BUCKETS) {
  const { data: existing } = await supabase.storage.getBucket(name);
  if (existing) {
    console.log(`✓ Bucket "${name}" already exists.`);
    continue;
  }
  const { error } = await supabase.storage.createBucket(name, { public: false });
  if (error) {
    console.error(`✗ Failed to create bucket "${name}":`, error.message);
  } else {
    console.log(`✓ Created private bucket "${name}".`);
  }
}
