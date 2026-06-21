'use client';

import Link from 'next/link';
import { Bookmark } from 'lucide-react';

function countdown(expiresAt) {
  if (!expiresAt) return null;
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  if (diffMs <= 0) return 'Expired';
  const hours = Math.floor(diffMs / (60 * 60 * 1000));
  if (hours < 24) return `${hours}h left`;
  const days = Math.floor(hours / 24);
  return `${days}d left`;
}

export default function SavedOffersList({ savedOffers = [] }) {
  return (
    <div className="bg-ag-bg-surface border border-ag-border rounded-xl p-6 mb-6">
      <h2 className="font-display text-lg font-semibold text-ag-fg-base mb-4 flex items-center gap-2">
        <Bookmark className="w-4 h-4 text-ag-accent" strokeWidth={1.5} /> Saved offers
      </h2>
      {savedOffers.length === 0 ? (
        <p className="text-ag-fg-subtle text-sm py-4 text-center">
          Your magic lamp is empty — save offers to find them here.
        </p>
      ) : (
        <ul className="divide-y divide-ag-border">
          {savedOffers.map(so => {
            const offer = so.offers;
            const left = countdown(offer?.expires_at);
            return (
              <li key={so.id}>
                <Link
                  href={`/offers/${so.offer_id}`}
                  className="flex items-center justify-between py-3 hover:text-ag-accent transition-colors"
                >
                  <div>
                    <p className="text-sm text-ag-fg-base">{offer?.headline || 'Offer'}</p>
                    <p className="text-xs text-ag-fg-muted capitalize">{offer?.store}</p>
                  </div>
                  {left && (
                    <span className={`text-xs font-semibold shrink-0 ml-4 ${left === 'Expired' ? 'text-ag-error' : 'text-ag-warning'}`}>
                      {left}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
