import Link from 'next/link';
import { Ticket, QrCode, ChevronRight, Heart, Tag } from 'lucide-react';
import { STORE_COLORS, STORE_LABELS } from '@/lib/stores';

const STALE_MS = 4 * 60 * 60 * 1000;

export default function OfferCard({ offer, saved = false, onToggleSave }) {
  const { id, store, type, headline, discount_value, category, expires_at, created_at } = offer;
  const storeColor  = STORE_COLORS[store?.toLowerCase()] || '#8B5CF6';
  const isOnline    = type === 'online';
  const expiresLabel = expires_at
    ? new Date(expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '—';
  const isStale = created_at ? (Date.now() - new Date(created_at).getTime()) > STALE_MS : false;

  function handleSaveClick(e) {
    e.preventDefault();
    e.stopPropagation();
    onToggleSave?.(id, !saved);
  }

  return (
    <Link
      href={`/offers/${id}`}
      className="group relative block rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1"
      style={{
        background: 'rgba(17,13,44,0.85)',
        backdropFilter: 'blur(10px)',
        border: saved ? '1px solid rgba(251,191,36,0.3)' : '1px solid rgba(139,92,246,0.18)',
        boxShadow: saved
          ? '0 4px 24px rgba(0,0,0,0.4), 0 0 14px rgba(251,191,36,0.08)'
          : '0 4px 24px rgba(0,0,0,0.4)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.border = saved
          ? '1px solid rgba(251,191,36,0.55)'
          : '1px solid rgba(139,92,246,0.4)';
        e.currentTarget.style.boxShadow = `0 8px 40px rgba(0,0,0,0.5), 0 0 20px ${storeColor}18`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.border = saved
          ? '1px solid rgba(251,191,36,0.3)'
          : '1px solid rgba(139,92,246,0.18)';
        e.currentTarget.style.boxShadow = saved
          ? '0 4px 24px rgba(0,0,0,0.4), 0 0 14px rgba(251,191,36,0.08)'
          : '0 4px 24px rgba(0,0,0,0.4)';
      }}
    >
      {/* Store color top accent bar */}
      <div className="absolute top-0 left-4 right-4 h-[2px] rounded-b-full opacity-60 transition-opacity group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, transparent, ${storeColor}, transparent)` }} />

      {/* Heart / Favourite button */}
      {onToggleSave && (
        <button
          onClick={handleSaveClick}
          aria-label={saved ? `Remove ${headline} from favourites` : `Add ${headline} to favourites`}
          aria-pressed={saved}
          className="absolute top-3.5 right-3.5 w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-150 hover:scale-110 active:scale-95"
          style={saved ? {
            background: 'rgba(251,191,36,0.18)',
            border: '1px solid rgba(251,191,36,0.4)',
            boxShadow: '0 0 12px rgba(251,191,36,0.25)',
          } : {
            background: 'rgba(139,92,246,0.12)',
            border: '1px solid rgba(139,92,246,0.2)',
          }}
        >
          <Heart
            className="w-4 h-4 transition-all duration-150"
            style={saved
              ? { color: '#FBBF24', fill: '#FBBF24', filter: 'drop-shadow(0 0 4px rgba(251,191,36,0.6))' }
              : { color: '#5B4D8C', fill: 'none' }}
            strokeWidth={saved ? 0 : 1.8}
          />
        </button>
      )}

      {/* Top row */}
      <div className="flex items-center justify-between mb-3.5 pr-8">
        {/* Store name */}
        <span className="text-xs font-bold uppercase tracking-wider"
          style={{ color: storeColor, textShadow: `0 0 12px ${storeColor}60` }}>
          {STORE_LABELS[store?.toLowerCase()] || store}
        </span>

        <div className="flex items-center gap-2">
          {/* Discount badge */}
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg"
            style={{
              background: 'rgba(251,191,36,0.12)',
              border: '1px solid rgba(251,191,36,0.3)',
              color: '#FBBF24',
            }}>
            <Tag className="w-3 h-3" strokeWidth={2} />
            {discount_value}
          </span>

          {/* Type badge */}
          <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg border`}
            style={isOnline ? {
              background: 'rgba(20,184,166,0.1)',
              border: '1px solid rgba(20,184,166,0.25)',
              color: '#14B8A6',
            } : {
              background: 'rgba(139,92,246,0.1)',
              border: '1px solid rgba(139,92,246,0.25)',
              color: '#A78BFA',
            }}>
            {isOnline
              ? <Ticket className="w-3 h-3" strokeWidth={1.5} />
              : <QrCode  className="w-3 h-3" strokeWidth={1.5} />}
            {isOnline ? 'Online' : 'In-store'}
          </span>
        </div>
      </div>

      {/* Headline */}
      <h3 className="font-semibold text-ag-fg-base text-sm leading-snug line-clamp-2 mb-4">
        {headline}
      </h3>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {category && (
            <span className="text-xs text-ag-fg-muted px-2 py-0.5 rounded-md"
              style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.12)' }}>
              {category}
            </span>
          )}
          {isStale && (
            <span className="text-[10px]" style={{ color: '#F59E0B' }}>may be outdated</span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-ag-fg-muted group-hover:text-ag-fg-subtle transition-colors">
          <span>Expires {expiresLabel}</span>
          <ChevronRight className="w-3.5 h-3.5 text-ag-magic group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
        </div>
      </div>
    </Link>
  );
}
