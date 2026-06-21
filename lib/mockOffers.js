// Fallback offer set — used when Rakuten isn't configured yet and the
// Supabase `offers` cache is empty. Shaped exactly like the `offers` table
// (see specs/database.md) so the API routes can treat real and mock rows
// identically.
export const MOCK_OFFERS = [
  { id: 'mock-1', store: 'target', type: 'online', headline: '20% off Electronics', discount_value: '20% off', category: 'Electronics', coupon_code: 'TGT20ELEC', qr_value: null, retailer_url: 'https://www.target.com/c/electronics', expires_at: '2026-06-30T00:00:00Z', is_active: true },
  { id: 'mock-2', store: 'walmart', type: 'online', headline: '$10 off $50 Grocery Order', discount_value: '$10 off', category: 'Grocery', coupon_code: 'WMT10GROC', qr_value: null, retailer_url: 'https://www.walmart.com/cp/grocery', expires_at: '2026-06-28T00:00:00Z', is_active: true },
  { id: 'mock-3', store: 'cvs', type: 'offline', headline: '30% off Beauty Products', discount_value: '30% off', category: 'Beauty', coupon_code: null, qr_value: 'CVS-BEAUTY-30-OFF', retailer_url: 'https://www.cvs.com/shop/beauty', expires_at: '2026-07-05T00:00:00Z', is_active: true },
  { id: 'mock-4', store: 'target', type: 'offline', headline: 'Buy 2 Get 1 Free — Apparel', discount_value: 'B2G1 free', category: 'Apparel', coupon_code: null, qr_value: 'TGT-APPAREL-B2G1', retailer_url: 'https://www.target.com/c/clothing', expires_at: '2026-07-02T00:00:00Z', is_active: true },
  { id: 'mock-5', store: 'walmart', type: 'online', headline: '15% off Home & Garden', discount_value: '15% off', category: 'Home', coupon_code: 'WMT15HOME', qr_value: null, retailer_url: 'https://www.walmart.com/cp/home', expires_at: '2026-06-26T00:00:00Z', is_active: true },
  { id: 'mock-6', store: 'cvs', type: 'online', headline: '$5 off $25 Health Purchase', discount_value: '$5 off', category: 'Health', coupon_code: 'CVS5HLTH', qr_value: null, retailer_url: 'https://www.cvs.com/shop/health', expires_at: '2026-06-24T00:00:00Z', is_active: true },
  { id: 'mock-7', store: 'macys', type: 'online', headline: '25% off Designer Apparel', discount_value: '25% off', category: 'Apparel', coupon_code: 'MCY25APP', qr_value: null, retailer_url: 'https://www.macys.com/shop/womens-clothing', expires_at: '2026-06-29T00:00:00Z', is_active: true },
  { id: 'mock-8', store: 'macys', type: 'offline', headline: 'Buy 1 Get 1 50% Off — Shoes', discount_value: 'BOGO 50%', category: 'Apparel', coupon_code: null, qr_value: 'MCY-SHOES-BOGO50', retailer_url: 'https://www.macys.com/shop/shoes', expires_at: '2026-07-03T00:00:00Z', is_active: true },
  { id: 'mock-9', store: 'bestbuy', type: 'online', headline: '$50 off Laptops & Tablets', discount_value: '$50 off', category: 'Electronics', coupon_code: 'BBY50TECH', qr_value: null, retailer_url: 'https://www.bestbuy.com/site/computers-pcs/laptops', expires_at: '2026-06-27T00:00:00Z', is_active: true },
  { id: 'mock-10', store: 'bestbuy', type: 'offline', headline: '10% off Smart Home Devices', discount_value: '10% off', category: 'Electronics', coupon_code: null, qr_value: 'BBY-SMARTHOME-10', retailer_url: 'https://www.bestbuy.com/site/smart-home', expires_at: '2026-07-01T00:00:00Z', is_active: true },
  { id: 'mock-11', store: 'wholefoods', type: 'online', headline: '$8 off $40 Grocery Order', discount_value: '$8 off', category: 'Grocery', coupon_code: 'WFM8GROC', qr_value: null, retailer_url: 'https://www.wholefoodsmarket.com/sales-flyer', expires_at: '2026-06-25T00:00:00Z', is_active: true },
  { id: 'mock-12', store: 'wholefoods', type: 'offline', headline: '20% off Organic Produce', discount_value: '20% off', category: 'Grocery', coupon_code: null, qr_value: 'WFM-PRODUCE-20', retailer_url: 'https://www.wholefoodsmarket.com/sales-flyer', expires_at: '2026-06-23T00:00:00Z', is_active: true },
  { id: 'mock-13', store: 'jcpenney', type: 'online', headline: '30% off Home Decor', discount_value: '30% off', category: 'Home', coupon_code: 'JCP30HOME', qr_value: null, retailer_url: 'https://www.jcpenney.com/g/home', expires_at: '2026-07-04T00:00:00Z', is_active: true },
  { id: 'mock-14', store: 'jcpenney', type: 'offline', headline: '$15 off $75 Apparel Purchase', discount_value: '$15 off', category: 'Apparel', coupon_code: null, qr_value: 'JCP-APPAREL-15OFF', retailer_url: 'https://www.jcpenney.com/g/women', expires_at: '2026-06-22T00:00:00Z', is_active: true },
];

export function getMockOffer(id) {
  return MOCK_OFFERS.find(o => o.id === id) || null;
}
