import Link from 'next/link';
import { Ticket, QrCode, ChevronRight, Bookmark } from 'lucide-react';
import { STORE_COLORS, STORE_LABELS } from '@/lib/stores';

const STALE_MS = 4 * 60 * 60 * 1000;

export default function OfferCard({ offer, saved = false, onToggleSave }) {
  const { id, store, type, headline, discount_value, category, expires_at, created_at } = offer;
  const storeColor = STORE_COLORS[store?.toLowerCase()] || '#D4AF37';
  const isOnline   = type === 'online';
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
      className="group relative block bg-ag-bg-surface border border-ag-border rounded-xl p-5 hover:border-ag-border-strong hover:shadow-[0_4px_24px_rgba(0,0,0,0.4),0_0_0_1px_rgba(212,175,55,0.20)] hover:-translate-y-0.5 transition-all duration-150"
    >
      {onToggleSave && (
        <button
          onClick={handleSaveClick}
          aria-label={saved ? `Remove ${headline} from saved offers` : `Save ${headline}`}
          aria-pressed={saved}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-ag-bg-elevated/80 hover:bg-ag-bg-elevated transition-colors"
        >
          <Bookmark
            className={saved ? 'w-3.5 h-3.5 text-ag-accent fill-ag-accent' : 'w-3.5 h-3.5 text-ag-fg-muted'}
            strokeWidth={1.5}
          />
        </button>
      )}

      {/* Top row */}
      <div className="flex items-center justify-between mb-3 pr-6">
        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: storeColor }}>
          {STORE_LABELS[store?.toLowerCase()] || store}
        </span>
        <div className="flex items-center gap-2">
          {/* Discount badge */}
          <span className="bg-ag-accent text-ag-fg-inverted text-xs font-bold px-2 py-0.5 rounded-full">
            {discount_value}
          </span>
          {/* Type badge */}
          <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
            isOnline
              ? 'bg-ag-genie-subtle text-ag-genie border-[rgba(45,199,199,0.25)]'
              : 'bg-ag-accent-subtle text-ag-accent border-ag-border'
          }`}>
            {isOnline
              ? <Ticket   className="w-3 h-3" strokeWidth={1.5} />
              : <QrCode   className="w-3 h-3" strokeWidth={1.5} />}
            {isOnline ? 'Online' : 'In-store'}
          </span>
        </div>
      </div>

      {/* Headline */}
      <h3 className="font-semibold text-ag-fg-base text-sm leading-snug line-clamp-2 mb-3">
        {headline}
      </h3>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-ag-genie">{category}</span>
          {isStale && (
            <span className="text-[10px] text-ag-warning" title="This offer data may be outdated">
              · may be outdated
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-ag-fg-muted">
          <span>Expires {expiresLabel}</span>
          <ChevronRight className="w-3.5 h-3.5 text-ag-accent group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
        </div>
      </div>
    </Link>
  );
}
