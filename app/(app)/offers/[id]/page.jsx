'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Flag } from 'lucide-react';
import CouponCodeBlock from '@/components/CouponCodeBlock';
import QRCodeBlock from '@/components/QRCodeBlock';
import PosterPanel from '@/components/PosterPanel';
import HashtagPanel from '@/components/HashtagPanel';
import ReportIssueModal from '@/components/ReportIssueModal';
import { useToast } from '@/components/Toast';
import { STORE_COLORS, STORE_LABELS } from '@/lib/stores';

export default function OfferDetailPage() {
  const { id } = useParams();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [qrLogged, setQrLogged] = useState(false);
  const [userPhotoBase64, setUserPhotoBase64] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);
  const showToast = useToast();

  useEffect(() => {
    const id = localStorage.getItem('userId');
    setUserId(id);
    if (!id) return;
    // Best-effort: read the user's saved profile photo so poster generation
    // can incorporate it. No photo on file is a normal, non-blocking case.
    fetch(`/api/profile?userId=${id}`)
      .then(res => res.json())
      .then(async data => {
        if (!data.photoUrl) return;
        const res = await fetch(data.photoUrl);
        const blob = await res.blob();
        const reader = new FileReader();
        reader.onloadend = () => setUserPhotoBase64(reader.result);
        reader.readAsDataURL(blob);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/offers/${id}`)
      .then(res => res.json())
      .then(data => { if (!cancelled) setOffer(data.offer || null); })
      .catch(() => { if (!cancelled) setOffer(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  // Log the redemption event the moment a QR code is shown — there's no
  // separate "copy" action for offline offers, so display itself is the event.
  useEffect(() => {
    if (offer?.type === 'offline' && userId && !qrLogged) {
      setQrLogged(true);
      fetch('/api/redemptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, offerId: offer.id, channel: 'offline', discountValue: offer.discount_value }),
      }).catch(() => {});
    }
  }, [offer, userId, qrLogged]);

  function handleCouponCopy() {
    if (!userId || !offer) return;
    fetch('/api/redemptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, offerId: offer.id, channel: 'online', discountValue: offer.discount_value }),
    }).catch(() => {});
  }

  async function handleReportSubmit({ reason, details }) {
    setReportOpen(false);
    try {
      await fetch('/api/offers/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, offerId: offer.id, reason, details }),
      });
    } catch {
      // best-effort — still confirm to the user below
    }
    showToast('Thanks — we\'ll look into it.', 'genie');
  }

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="h-40 rounded-xl bg-ag-bg-surface border border-ag-border animate-pulse" />
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-4xl">🪔</p>
        <p className="font-display text-xl text-ag-fg-base">This deal has vanished.</p>
        <Link href="/offers" className="text-ag-accent text-sm hover:underline">Browse fresh offers</Link>
      </div>
    );
  }

  const storeColor = STORE_COLORS[offer.store?.toLowerCase()] || '#D4AF37';
  const expiresLabel = offer.expires_at
    ? new Date(offer.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link href="/offers" className="inline-flex items-center gap-1.5 text-ag-fg-subtle text-sm hover:text-ag-fg-base mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> Back to offers
      </Link>

      <div className="bg-ag-bg-surface border border-ag-border rounded-xl p-6 mb-5">
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: storeColor }}>
            {STORE_LABELS[offer.store?.toLowerCase()] || offer.store}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
            offer.type === 'online'
              ? 'bg-ag-genie-subtle text-ag-genie border-[rgba(45,199,199,0.25)]'
              : 'bg-ag-accent-subtle text-ag-accent border-ag-border'
          }`}>
            {offer.type === 'online' ? 'Online' : 'In-store'}
          </span>
        </div>
        <h1 className="font-display text-2xl font-semibold text-ag-fg-base mb-1">{offer.headline}</h1>
        <p className="text-ag-fg-subtle text-sm mb-3">{offer.category} · Expires {expiresLabel}</p>
        <p className="text-xs text-ag-warning mt-3">
          ⚠ Always verify the discount is active before completing your purchase.
        </p>
      </div>

      {offer.type === 'online' ? (
        <CouponCodeBlock code={offer.coupon_code || 'N/A'} onCopy={handleCouponCopy} />
      ) : (
        <QRCodeBlock value={offer.qr_value || offer.retailer_url} />
      )}

      <PosterPanel offer={offer} userId={userId} userPhotoBase64={userPhotoBase64} />
      <HashtagPanel offer={offer} userId={userId} />

      <button
        onClick={() => setReportOpen(true)}
        className="w-full mt-5 inline-flex items-center justify-center gap-2 text-xs text-ag-fg-muted hover:text-ag-error transition-colors py-2"
      >
        <Flag className="w-3.5 h-3.5" strokeWidth={1.5} /> Report an issue with this offer
      </button>

      {reportOpen && (
        <ReportIssueModal onSubmit={handleReportSubmit} onClose={() => setReportOpen(false)} />
      )}
    </div>
  );
}
