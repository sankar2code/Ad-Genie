// Rakuten MerchandiseSearch API client.
// Docs: https://developers.rakutenadvertising.com (Product/Merchandise Search API).
// NOTE: Rakuten's real auth flow is OAuth-token based (client id/secret exchanged for a
// bearer token), which varies by account type. Adjust `fetchToken`/the request below to
// match the exact contract once real RAKUTEN_API_KEY / RAKUTEN_PUBLISHER_ID values and
// API docs for this account are available. Until then this throws and callers fall back
// to the Supabase cache / mock data — see app/api/offers/route.js.

const RAKUTEN_BASE_URL = 'https://api.rakutenmarketing.com/productsearch/1.0';

function isConfigured() {
  const key = process.env.RAKUTEN_API_KEY;
  const pubId = process.env.RAKUTEN_PUBLISHER_ID;
  return Boolean(
    key && pubId &&
    !key.includes('your-rakuten') && !pubId.includes('your-rakuten'),
  );
}

const STORE_MERCHANT_IDS = {
  target: process.env.RAKUTEN_TARGET_MERCHANT_ID,
  walmart: process.env.RAKUTEN_WALMART_MERCHANT_ID,
  cvs: process.env.RAKUTEN_CVS_MERCHANT_ID,
  macys: process.env.RAKUTEN_MACYS_MERCHANT_ID,
  bestbuy: process.env.RAKUTEN_BESTBUY_MERCHANT_ID,
  wholefoods: process.env.RAKUTEN_WHOLEFOODS_MERCHANT_ID,
  jcpenney: process.env.RAKUTEN_JCPENNEY_MERCHANT_ID,
};

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 300;
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Retries transient failures (429/5xx, network errors) with exponential
// backoff. Auth/4xx errors (other than 429) fail immediately — retrying
// won't fix a bad key or malformed request.
async function fetchWithRetry(url, options) {
  let lastErr;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;
      if (!RETRYABLE_STATUSES.has(res.status) || attempt === MAX_RETRIES) {
        throw new Error(`Rakuten API error: ${res.status} ${await res.text().catch(() => '')}`);
      }
      lastErr = new Error(`Rakuten API error: ${res.status} (attempt ${attempt + 1}/${MAX_RETRIES + 1})`);
    } catch (err) {
      lastErr = err;
      if (attempt === MAX_RETRIES) throw lastErr;
    }
    await sleep(BASE_DELAY_MS * 2 ** attempt);
  }
  throw lastErr;
}

export async function fetchRakutenOffers({ store, type }) {
  if (!isConfigured()) {
    throw new Error('Rakuten API not configured — RAKUTEN_API_KEY / RAKUTEN_PUBLISHER_ID missing or placeholder');
  }

  const params = new URLSearchParams({
    publisherId: process.env.RAKUTEN_PUBLISHER_ID,
    keyword: type === 'offline' ? 'in-store offer' : 'coupon',
    max: '20',
  });
  const merchantId = STORE_MERCHANT_IDS[store];
  if (merchantId) params.set('mid', merchantId);

  const res = await fetchWithRetry(`${RAKUTEN_BASE_URL}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${process.env.RAKUTEN_API_KEY}` },
  });

  const data = await res.json();
  const items = data?.item || data?.items || [];

  return items.map(item => ({
    store,
    type,
    headline: item.productName || item.title || 'Special offer',
    discount_value: item.discount || item.salePrice || 'See details',
    category: item.category || item.primaryCategory || 'Home',
    coupon_code: type === 'online' ? (item.couponCode || null) : null,
    qr_value: type === 'offline' ? (item.linkId || item.productUrl || null) : null,
    retailer_url: item.linkUrl || item.productUrl || null,
    expires_at: item.endDate || null,
    is_active: true,
  }));
}

export { isConfigured as isRakutenConfigured };
