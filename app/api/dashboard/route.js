import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

function startOfMonthISO() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}

function computeStreak(dates) {
  // dates: array of 'YYYY-MM-DD' strings, unique, descending
  if (dates.length === 0) return 0;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  let streak = 0;
  let cursor = today;
  const set = new Set(dates);
  while (set.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor = new Date(cursor);
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'userId query param is required' }, { status: 400 });
  }

  try {
    const [redemptionsRes, postersRes, downloadEventsRes, hashtagCopyRes, savedOffersRes] = await Promise.all([
      supabaseAdmin
        .from('redemptions')
        .select('*, offers(store, category, headline)')
        .eq('user_id', userId)
        .order('redeemed_at', { ascending: false }),
      supabaseAdmin
        .from('posters')
        .select('*, offers(headline)')
        .eq('user_id', userId)
        .order('generated_at', { ascending: false }),
      supabaseAdmin
        .from('download_events')
        .select('*, offers(headline)')
        .eq('user_id', userId)
        .order('downloaded_at', { ascending: false }),
      supabaseAdmin
        .from('hashtag_copy_events')
        .select('*, hashtag_sets(offer_id, offers(headline))')
        .eq('user_id', userId)
        .order('copied_at', { ascending: false }),
      supabaseAdmin
        .from('saved_offers')
        .select('*, offers(store, headline, category, expires_at)')
        .eq('user_id', userId)
        .order('saved_at', { ascending: false }),
    ]);

    const redemptions = redemptionsRes.data || [];
    const posters = postersRes.data || [];
    const downloadEvents = downloadEventsRes.data || [];
    const hashtagCopyEvents = hashtagCopyRes.data || [];
    const savedOffers = savedOffersRes.data || [];

    const totalSavings = redemptions.reduce((sum, r) => sum + (r.savings_amount || 0), 0);
    const monthCutoff = startOfMonthISO();
    const savingsThisMonth = redemptions
      .filter(r => r.redeemed_at >= monthCutoff)
      .reduce((sum, r) => sum + (r.savings_amount || 0), 0);

    const onlineCount = redemptions.filter(r => r.channel === 'online').length;
    const offlineCount = redemptions.filter(r => r.channel === 'offline').length;

    const redeemedOfferIds = new Set(redemptions.map(r => r.offer_id));
    const activeOffers = savedOffers.filter(so => !redeemedOfferIds.has(so.offer_id)).length;

    const in24h = Date.now() + 24 * 60 * 60 * 1000;
    const expiringToday = savedOffers.filter(so => {
      const exp = so.offers?.expires_at;
      return exp && new Date(exp).getTime() <= in24h && new Date(exp).getTime() >= Date.now();
    }).length;

    const storeCounts = {};
    const categorySavings = {};
    for (const r of redemptions) {
      const store = r.offers?.store;
      if (store) storeCounts[store] = (storeCounts[store] || 0) + 1;
      const category = r.offers?.category;
      if (category) categorySavings[category] = (categorySavings[category] || 0) + (r.savings_amount || 0);
    }
    const favouriteStore = Object.entries(storeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
    const topCategory = Object.entries(categorySavings).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
    const avgSavingPerCoupon = redemptions.length > 0 ? totalSavings / redemptions.length : 0;

    const redeemedDates = [...new Set(redemptions.map(r => r.redeemed_at.slice(0, 10)))];
    const savingsStreak = computeStreak(redeemedDates);

    const kpis = {
      totalSavings,
      savingsThisMonth,
      onlineCount,
      offlineCount,
      activeOffers,
      expiringToday,
      favouriteStore,
      postersGenerated: posters.length,
      postersDownloaded: downloadEvents.length,
      savingsStreak,
      topCategory,
      avgSavingPerCoupon,
    };

    const activity = [
      ...redemptions.map(r => ({
        type: 'redemption',
        id: r.id,
        text: `${r.offers?.headline || 'Offer redeemed'} — ${r.offers?.store || ''}`,
        amount: r.savings_amount,
        timestamp: r.redeemed_at,
      })),
      ...posters.map(p => ({
        type: 'poster',
        id: p.id,
        text: `AI poster generated — ${p.offers?.headline || 'offer'}`,
        amount: null,
        timestamp: p.generated_at,
      })),
      ...downloadEvents.map(d => ({
        type: 'download',
        id: d.id,
        text: `Poster downloaded — ${d.offers?.headline || 'offer'}`,
        amount: null,
        timestamp: d.downloaded_at,
      })),
      ...hashtagCopyEvents.map(h => ({
        type: 'hashtag_copy',
        id: h.id,
        text: `Hashtags copied — ${h.hashtag_sets?.offers?.headline || 'offer'}`,
        amount: null,
        timestamp: h.copied_at,
      })),
    ]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 200);

    return NextResponse.json({
      kpis,
      redemptions,
      activity,
      savedOffers,
    });
  } catch (err) {
    console.error('GET /api/dashboard error:', err.message);
    return NextResponse.json({
      kpis: null,
      redemptions: [],
      activity: [],
      savedOffers: [],
      error: err.message,
    }, { status: 200 });
  }
}
