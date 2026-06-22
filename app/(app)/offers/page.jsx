'use client';

import { useState, useEffect, useMemo } from 'react';
import { MapPin, Search, SlidersHorizontal, Heart } from 'lucide-react';
import OfferCard from '@/components/OfferCard';
import ZipFallbackModal from '@/components/ZipFallbackModal';
import { useToast } from '@/components/Toast';
import { STORE_KEYS, STORE_LABELS as BASE_STORE_LABELS } from '@/lib/stores';

const STORES = ['All', ...STORE_KEYS];
const STORE_LABELS = { All: 'All', ...BASE_STORE_LABELS };
const TABS = ['online', 'offline', 'favorites'];
const EXPIRY_RANGES = [
  { value: 'all', label: 'Any time' },
  { value: 'today', label: 'Expiring today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
];
const SORTS = [
  { value: 'none', label: 'Default' },
  { value: 'savings', label: 'Savings (high to low)' },
  { value: 'expiry', label: 'Expiry (soonest first)' },
  { value: 'distance', label: 'Distance (nearest first)' },
];

function parseDiscountAmount(value) {
  const match = String(value || '').match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

export default function OffersPage() {
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('online');
  const [activeStore, setActiveStore] = useState('All');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [expiryRange, setExpiryRange] = useState('all');
  const [sortBy, setSortBy] = useState('none');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [nearbyStores, setNearbyStores] = useState(STORES.slice(1));
  const [storeDistances, setStoreDistances] = useState({});
  const [offers, setOffers] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [locationLabel, setLocationLabel] = useState('Finding deals near you…');
  const [zipModalOpen, setZipModalOpen] = useState(false);
  const showToast = useToast();

  useEffect(() => {
    const id = localStorage.getItem('userId');
    setUserId(id);
    if (id) {
      fetch(`/api/offers/save?userId=${id}`)
        .then(res => res.json())
        .then(data => setSavedIds(new Set(data.offerIds || [])))
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    // Load offers immediately so the page never blocks on geolocation
    loadOffers();
    if (!navigator.geolocation) {
      setZipModalOpen(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolveLocation(pos.coords.latitude, pos.coords.longitude),
      () => {/* geo failed — offers already loaded above */},
      { timeout: 5000 },
    );
  }, []);

  async function resolveLocation(lat, lng) {
    setLocationLabel('Deals near you');
    try {
      const res = await fetch(`/api/places?lat=${lat}&lng=${lng}`);
      const data = await res.json();
      if (data.stores?.length) setNearbyStores(data.stores);
      if (data.details) {
        const distances = {};
        for (const [store, info] of Object.entries(data.details)) {
          distances[store] = info.distanceMiles;
        }
        setStoreDistances(distances);
      }
    } catch (err) {
      console.error('Places lookup failed:', err);
    }
    loadOffers();
  }

  async function handleZipSubmit(zip) {
    setZipModalOpen(false);
    setLocationLabel(`Deals near ${zip}`);
    loadOffers();
  }

  async function loadOffers() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/offers');
      const data = await res.json();
      setOffers(data.offers || []);
    } catch (err) {
      console.error('Failed to load offers:', err);
      setOffers([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleToggleSave(offerId, shouldSave) {
    if (!userId) return;
    setSavedIds(prev => {
      const next = new Set(prev);
      if (shouldSave) next.add(offerId); else next.delete(offerId);
      return next;
    });
    try {
      if (shouldSave) {
        await fetch('/api/offers/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, offerId }),
        });
        showToast('Saved. We’ll remind you before it expires.', 'genie');
      } else {
        await fetch(`/api/offers/save/${offerId}?userId=${userId}`, { method: 'DELETE' });
        showToast('Removed from saved offers.', 'genie');
      }
    } catch {
      showToast('Could not update saved offers.', 'error');
    }
  }

  const categories = useMemo(() => {
    const set = new Set(offers.map(o => o.category).filter(Boolean));
    return ['all', ...set];
  }, [offers]);

  const filtered = useMemo(() => {
    const now = Date.now();
    const result = offers.filter(o => {
      // Favorites tab: show ALL saved offers regardless of type
      const matchTab = activeTab === 'favorites'
        ? savedIds.has(o.id)
        : o.type === activeTab;

      const matchStore = activeStore === 'All' || o.store === activeStore;
      const haystack = `${o.headline} ${o.category}`.toLowerCase();
      const matchSearch = haystack.includes(search.toLowerCase());
      const matchCategory = category === 'all' || o.category === category;

      let matchExpiry = true;
      if (expiryRange !== 'all' && o.expires_at) {
        const expiresMs = new Date(o.expires_at).getTime();
        const diff = expiresMs - now;
        if (expiryRange === 'today') matchExpiry = diff <= 24 * 60 * 60 * 1000;
        if (expiryRange === 'week') matchExpiry = diff <= 7 * 24 * 60 * 60 * 1000;
        if (expiryRange === 'month') matchExpiry = diff <= 30 * 24 * 60 * 60 * 1000;
      }

      return matchTab && matchStore && matchSearch && matchCategory && matchExpiry;
    });

    if (sortBy === 'savings') {
      result.sort((a, b) => parseDiscountAmount(b.discount_value) - parseDiscountAmount(a.discount_value));
    } else if (sortBy === 'expiry') {
      result.sort((a, b) => new Date(a.expires_at || 0) - new Date(b.expires_at || 0));
    } else if (sortBy === 'distance') {
      result.sort((a, b) => (storeDistances[a.store] ?? 999) - (storeDistances[b.store] ?? 999));
    }

    return result;
  }, [offers, activeTab, activeStore, search, category, expiryRange, sortBy, storeDistances, savedIds]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {zipModalOpen && (
        <ZipFallbackModal onSubmit={handleZipSubmit} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ag-fg-base">Offers</h1>
          <p className="text-ag-fg-subtle text-sm mt-0.5 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
            {locationLabel}
          </p>
        </div>
        <button
          onClick={() => setFiltersOpen(o => !o)}
          aria-expanded={filtersOpen}
          aria-controls="offers-filter-panel"
          className="flex items-center gap-2 text-sm text-ag-fg-subtle border border-ag-border rounded-lg px-3 py-2 hover:bg-ag-bg-surface transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" strokeWidth={1.5} />
          Filters
        </button>
      </div>

      {filtersOpen && (
        <div id="offers-filter-panel" className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5 bg-ag-bg-surface border border-ag-border rounded-xl p-4">
          <div>
            <label htmlFor="category-filter" className="block text-xs font-semibold text-ag-fg-subtle uppercase tracking-wide mb-1.5">Category</label>
            <select
              id="category-filter"
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full h-9 px-2.5 rounded-lg bg-ag-bg-base border border-ag-border text-ag-fg-base text-sm focus:outline-none focus:border-ag-border-strong"
            >
              {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All categories' : c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="expiry-filter" className="block text-xs font-semibold text-ag-fg-subtle uppercase tracking-wide mb-1.5">Expiry range</label>
            <select
              id="expiry-filter"
              value={expiryRange}
              onChange={e => setExpiryRange(e.target.value)}
              className="w-full h-9 px-2.5 rounded-lg bg-ag-bg-base border border-ag-border text-ag-fg-base text-sm focus:outline-none focus:border-ag-border-strong"
            >
              {EXPIRY_RANGES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="sort-filter" className="block text-xs font-semibold text-ag-fg-subtle uppercase tracking-wide mb-1.5">Sort by</label>
            <select
              id="sort-filter"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="w-full h-9 px-2.5 rounded-lg bg-ag-bg-base border border-ag-border text-ag-fg-base text-sm focus:outline-none focus:border-ag-border-strong"
            >
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ag-fg-muted" strokeWidth={1.5} />
        <label htmlFor="offer-search" className="sr-only">Search offers</label>
        <input
          id="offer-search"
          type="text"
          placeholder="Search offers…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-lg bg-ag-bg-surface border border-ag-border text-ag-fg-base placeholder:text-ag-fg-muted text-sm focus:outline-none focus:border-ag-border-strong"
        />
      </div>

      {/* Store chips */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1" role="group" aria-label="Filter by store">
        {['All', ...nearbyStores].map(s => (
          <button
            key={s}
            onClick={() => setActiveStore(s)}
            aria-pressed={activeStore === s}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              activeStore === s
                ? 'bg-ag-accent text-ag-fg-inverted border-ag-accent'
                : 'border-ag-border text-ag-fg-subtle hover:border-ag-border-strong hover:text-ag-fg-base'
            }`}
          >
            {STORE_LABELS[s] || s}
          </button>
        ))}
      </div>

      {/* Online / Offline / Favorites tabs */}
      <div className="flex border-b border-ag-border mb-6" role="tablist" aria-label="Filter offers by type">
        {TABS.map(tab => {
          const isActive = activeTab === tab;
          const isFav = tab === 'favorites';
          const favCount = savedIds.size;
          return (
            <button
              key={tab}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${
                isActive
                  ? isFav
                    ? 'border-[#FBBF24] text-[#FBBF24]'
                    : 'border-ag-accent text-ag-accent'
                  : 'border-transparent text-ag-fg-subtle hover:text-ag-fg-base'
              }`}
            >
              {isFav && (
                <Heart
                  className="w-3.5 h-3.5 transition-all"
                  style={isActive
                    ? { color: '#FBBF24', fill: '#FBBF24', filter: 'drop-shadow(0 0 4px rgba(251,191,36,0.5))' }
                    : { color: 'currentColor', fill: 'none' }}
                  strokeWidth={isActive ? 0 : 1.8}
                />
              )}
              {tab === 'online' ? 'Online' : tab === 'offline' ? 'Offline' : 'Favourites'}
              {isFav && favCount > 0 && (
                <span
                  className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold leading-none"
                  style={isActive
                    ? { background: 'rgba(251,191,36,0.25)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.4)' }
                    : { background: 'rgba(139,92,246,0.2)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.3)' }}
                >
                  {favCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Offer grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-ag-bg-surface border border-ag-border animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          {activeTab === 'favorites' ? (
            <>
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl mx-auto mb-4"
                style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
                <Heart className="w-7 h-7" style={{ color: '#FBBF24', fill: 'none' }} strokeWidth={1.5} />
              </div>
              <p className="font-display text-lg text-ag-fg-base mb-2">No favourites yet</p>
              <p className="text-ag-fg-subtle text-sm">
                Tap the <Heart className="inline w-3.5 h-3.5 mx-0.5 align-text-bottom" strokeWidth={1.8} /> on any deal to save it here.
              </p>
            </>
          ) : (
            <>
              <p className="text-4xl mb-4">🪔</p>
              <p className="font-display text-lg text-ag-fg-base mb-2">The Cave of Wonders is quiet…</p>
              <p className="text-ag-fg-subtle text-sm">Try a different location or check back soon.</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map(offer => (
            <OfferCard
              key={offer.id}
              offer={offer}
              saved={savedIds.has(offer.id)}
              onToggleSave={userId ? handleToggleSave : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
