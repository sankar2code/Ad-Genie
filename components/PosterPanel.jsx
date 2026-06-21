'use client';

import { useState } from 'react';
import { Wand2, Download } from 'lucide-react';

const MAX_ATTEMPTS = 3;

export default function PosterPanel({ offer, userId, userPhotoBase64 }) {
  const [posterUrl, setPosterUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [error, setError] = useState('');

  async function handleGenerate() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/poster', {
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
      const res = await fetch(posterUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `ad-genie-poster-${offer.id}.png`;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      // fall back to direct link if the image can't be fetched as a blob (e.g. CORS)
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
    <div className="bg-ag-bg-surface border border-ag-border rounded-xl p-6 mb-5">
      <h2 className="font-display text-lg font-semibold text-ag-fg-base mb-4">AI Ad Poster</h2>

      {error && (
        <p className="text-ag-error text-sm mb-3">{error}</p>
      )}

      {posterUrl ? (
        <div className="ag-genie-reveal">
          <img
            src={posterUrl}
            alt="Generated Ad Poster"
            className="w-full aspect-square object-cover rounded-xl border-2 border-ag-accent shadow-[0_0_32px_rgba(212,175,55,0.25)] mb-4"
          />
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-ag-border text-ag-fg-base text-sm font-semibold hover:bg-ag-bg-surface transition-colors"
            >
              <Download className="w-4 h-4" strokeWidth={1.5} /> Download PNG
            </button>
            {attemptsLeft > 0 && (
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="text-ag-fg-subtle text-xs hover:text-ag-fg-base transition-colors px-3 disabled:opacity-60"
              >
                Not quite right? Try again ({attemptsLeft} left)
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-ag-genie text-ag-fg-inverted font-semibold text-sm hover:bg-ag-genie-hover transition-colors disabled:opacity-60"
        >
          {loading ? (
            <><span className="ag-sparkle-pulse">✨</span> The Genie is at work…</>
          ) : (
            <><Wand2 className="w-4 h-4" strokeWidth={1.5} /> Generate My Ad Poster</>
          )}
        </button>
      )}
    </div>
  );
}
