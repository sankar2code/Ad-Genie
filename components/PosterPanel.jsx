'use client';

import { useState } from 'react';
import { Wand2, Download, RefreshCw, Sparkles } from 'lucide-react';
import GenieLamp from '@/components/icons/GenieLamp';

const MAX_ATTEMPTS = 3;

export default function PosterPanel({ offer, userId, userPhotoBase64 }) {
  const [posterUrl, setPosterUrl]     = useState(null);
  const [loading, setLoading]         = useState(false);
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [error, setError]             = useState('');

  async function handleGenerate() {
    setLoading(true);
    setError('');
    try {
      const res  = await fetch('/api/poster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offer, userId, userPhotoBase64 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Poster generation failed');
      setPosterUrl(data.imageUrl);
      setAttemptsUsed(n => n + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    if (!posterUrl) return;
    try {
      const res    = await fetch(posterUrl);
      const blob   = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a      = document.createElement('a');
      a.href       = blobUrl;
      a.download   = `ad-genie-poster-${offer.id}.png`;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(posterUrl, '_blank');
    }

    if (userId && offer.id) {
      fetch('/api/events/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, offerId: offer.id }),
      }).catch(() => {});
    }
  }

  const attemptsLeft = MAX_ATTEMPTS - attemptsUsed;

  return (
    <div className="rounded-2xl p-6 mb-5 ag-glass border border-ag-border"
      style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.4)' }}>

      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}>
          <Wand2 className="w-4 h-4 text-ag-magic" strokeWidth={1.5} />
        </div>
        <h2 className="font-display text-base font-semibold text-ag-fg-base">AI Ad Poster</h2>
      </div>

      {error && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl mb-4 text-sm"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#FCA5A5' }}>
          {error}
        </div>
      )}

      {posterUrl ? (
        <div className="ag-genie-reveal">
          {/* Generated poster */}
          <div className="relative rounded-xl overflow-hidden mb-4"
            style={{ boxShadow: '0 0 40px rgba(139,92,246,0.3), 0 0 0 1px rgba(251,191,36,0.2)' }}>
            <img src={posterUrl} alt="Generated Ad Poster" className="w-full aspect-square object-cover" />
            {/* Gold corner accent */}
            <div className="absolute inset-0 pointer-events-none rounded-xl"
              style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.08) 0%, transparent 40%, transparent 60%, rgba(139,92,246,0.08) 100%)' }} />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm ag-btn-magic"
            >
              <Download className="w-4 h-4" strokeWidth={1.5} /> Download Poster
            </button>
            {attemptsLeft > 0 && (
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-ag-border text-ag-fg-subtle text-xs font-semibold hover:text-ag-fg-base hover:border-ag-border-strong transition-all disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} />
                Retry ({attemptsLeft})
              </button>
            )}
          </div>
        </div>
      ) : (
        <div>
          {/* Empty state illustration */}
          {!loading && (
            <div className="flex flex-col items-center py-6 mb-4 rounded-xl"
              style={{ background: 'rgba(139,92,246,0.04)', border: '1px dashed rgba(139,92,246,0.2)' }}>
              <GenieLamp size={56} className="mb-3 opacity-70" />
              <p className="text-ag-fg-muted text-xs text-center max-w-[180px] leading-relaxed">
                The Genie will craft a personalised ad poster for this offer
              </p>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center py-8 mb-4 rounded-xl"
              style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)' }}>
              <div className="relative mb-4">
                <GenieLamp size={64} className="ag-float" />
                {/* Orbiting sparkle */}
                <div className="absolute top-0 right-0 w-4 h-4"
                  style={{ animation: 'agRotateSlow 2s linear infinite', transformOrigin: '-24px 24px' }}>
                  <Sparkles className="w-4 h-4 text-ag-accent" />
                </div>
              </div>
              <p className="text-ag-magic font-semibold text-sm mb-1">The Genie is at work…</p>
              <p className="text-ag-fg-muted text-xs">Conjuring your perfect ad poster</p>
              {/* Loading bar */}
              <div className="mt-4 w-32 h-1 rounded-full overflow-hidden"
                style={{ background: 'rgba(139,92,246,0.15)' }}>
                <div className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #8B5CF6, #14B8A6)',
                    animation: 'agShimmer 1.5s ease-in-out infinite',
                    width: '60%',
                  }} />
              </div>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm ag-btn-magic ag-shimmer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Conjuring…
              </>
            ) : (
              <><Wand2 className="w-4 h-4" strokeWidth={1.5} /> Generate My Ad Poster</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
