import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { fetchRakutenOffers, isRakutenConfigured } from '@/lib/rakuten';
import { MOCK_OFFERS } from '@/lib/mockOffers';

const STALE_MS = 4 * 60 * 60 * 1000; // 4h cache TTL per app-plan.md

const STORES = ['target', 'walmart', 'cvs', 'macys', 'bestbuy', 'wholefoods', 'jcpenney'];
const TYPES = ['online', 'offline'];

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const store = searchParams.get('store'); // optional: one of STORES
  const stores = store && STORES.includes(store) ? [store] : STORES;

  try {
    const cutoff = new Date(Date.now() - STALE_MS).toISOString();

    let query = supabaseAdmin
      .from('offers')
      .select('*')
      .eq('is_active', true)
      .in('store', stores)
      .gte('created_at', cutoff);

    const { data: cached, error: cacheError } = await query;

    if (!cacheError && cached && cached.length > 0) {
      return NextResponse.json({ offers: cached, source: 'cache' });
    }

    // Cache miss or empty — try Rakuten, then fall back to mock data.
    if (isRakutenConfigured()) {
      const fresh = [];
      for (const s of stores) {
        for (const t of TYPES) {
          try {
            const items = await fetchRakutenOffers({ store: s, type: t });
            fresh.push(...items);
          } catch (err) {
            console.error(`Rakuten fetch failed for ${s}/${t}:`, err.message);
          }
        }
      }

      if (fresh.length > 0) {
        const { data: inserted, error: insertError } = await supabaseAdmin
          .from('offers')
          .insert(fresh)
          .select('*');

        if (insertError) console.error('Failed to cache Rakuten offers:', insertError.message);
        return NextResponse.json({ offers: insertError ? fresh : inserted, source: 'rakuten' });
      }
    }

    const mockSubset = MOCK_OFFERS.filter(o => stores.includes(o.store));
    return NextResponse.json({ offers: mockSubset, source: 'mock' });
  } catch (err) {
    console.error('GET /api/offers error:', err);
    const mockSubset = MOCK_OFFERS.filter(o => stores.includes(o.store));
    return NextResponse.json({ offers: mockSubset, source: 'mock-fallback' });
  }
}
