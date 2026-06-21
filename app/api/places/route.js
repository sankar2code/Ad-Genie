import { NextResponse } from 'next/server';

const MILES_RADIUS = 10;
const METERS_RADIUS = MILES_RADIUS * 1609.34;

const STORE_QUERIES = {
  target: 'Target',
  walmart: 'Walmart',
  cvs: 'CVS Pharmacy',
  macys: "Macy's",
  bestbuy: 'Best Buy',
  wholefoods: 'Whole Foods Market',
  jcpenney: 'JCPenney',
};

function haversineMiles(lat1, lng1, lat2, lng2) {
  const R = 3958.8; // Earth radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

function isConfigured() {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  return Boolean(key && !key.includes('your-google-maps'));
}

async function findNearest(store, lat, lng, apiKey) {
  const params = new URLSearchParams({
    location: `${lat},${lng}`,
    radius: String(METERS_RADIUS),
    keyword: STORE_QUERIES[store],
    key: apiKey,
  });
  const res = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params.toString()}`);
  if (!res.ok) throw new Error(`Places API error: ${res.status}`);
  const data = await res.json();
  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(`Places API status: ${data.status} ${data.error_message || ''}`);
  }

  const results = (data.results || [])
    .map(r => ({
      name: r.name,
      address: r.vicinity,
      lat: r.geometry?.location?.lat,
      lng: r.geometry?.location?.lng,
    }))
    .filter(r => r.lat != null && r.lng != null)
    .map(r => ({ ...r, distanceMiles: haversineMiles(lat, lng, r.lat, r.lng) }))
    .filter(r => r.distanceMiles <= MILES_RADIUS)
    .sort((a, b) => a.distanceMiles - b.distanceMiles);

  return results[0] || null;
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get('lat'));
  const lng = parseFloat(searchParams.get('lng'));

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json({ error: 'lat and lng query params are required' }, { status: 400 });
  }

  if (!isConfigured()) {
    // Graceful degrade: no real Places lookup configured — assume every
    // retailer is "nearby" so the store filter chips still render.
    return NextResponse.json({
      stores: Object.keys(STORE_QUERIES),
      details: {},
      source: 'unconfigured',
    });
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const stores = [];
  const details = {};

  for (const store of Object.keys(STORE_QUERIES)) {
    try {
      const nearest = await findNearest(store, lat, lng, apiKey);
      if (nearest) {
        stores.push(store);
        details[store] = nearest;
      }
    } catch (err) {
      console.error(`Places lookup failed for ${store}:`, err.message);
    }
  }

  return NextResponse.json({ stores, details, source: 'google-places' });
}
