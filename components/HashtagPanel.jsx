'use client';

import { useState } from 'react';
import { Hash } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function HashtagPanel({ offer, userId }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hashtags, setHashtags] = useState(null);
  const [hashtagSetId, setHashtagSetId] = useState(null);
  const [error, setError] = useState('');
  const showToast = useToast();

  async function handleGenerate() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/hashtags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offer, userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Hashtag generation failed');
      setHashtags(data.hashtags);
      setHashtagSetId(data.hashtagSetId);
    } catch (err) {
      setError(err.message);
      setConfirming(false);
    } finally {
      setLoading(false);
    }
  }

  function logCopyAll() {
    if (!userId || !hashtagSetId) return;
    fetch('/api/events/hashtag-copy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, hashtagSetId }),
    }).catch(() => {});
  }

  return (
    <div className="bg-ag-bg-surface border border-ag-border rounded-xl p-6">
      <h2 className="font-display text-lg font-semibold text-ag-fg-base mb-4">Hashtags</h2>

      {error && <p className="text-ag-error text-sm mb-3">{error}</p>}

      {hashtags ? (
        <div className="ag-fade-in">
          <div className="flex flex-wrap gap-2 mb-4">
            {hashtags.map(tag => (
              <button
                key={tag}
                onClick={() => {
                  navigator.clipboard.writeText(tag);
                  showToast(`Copied ${tag}`, 'genie', 1500);
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-full bg-ag-accent-subtle text-ag-accent border border-[rgba(212,175,55,0.25)] hover:border-ag-border-strong transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(hashtags.join(' '));
              showToast('15 hashtags conjured. Copy and paste when you share.', 'genie');
              logCopyAll();
            }}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-ag-border text-ag-fg-base text-sm font-semibold hover:bg-ag-bg-elevated transition-colors"
          >
            <Hash className="w-4 h-4" strokeWidth={1.5} /> Copy all hashtags
          </button>
        </div>
      ) : confirming ? (
        <div>
          <p className="text-ag-fg-subtle text-sm mb-4">Want hashtags for this offer?</p>
          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-ag-accent text-ag-fg-inverted text-sm font-semibold hover:bg-ag-accent-hover transition-colors disabled:opacity-60"
            >
              {loading ? (
                <><span className="ag-sparkle-pulse">✨</span> Conjuring…</>
              ) : 'Confirm'}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="px-4 py-2.5 rounded-lg border border-ag-border text-ag-fg-subtle text-sm hover:text-ag-fg-base transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-ag-fg-subtle text-sm mb-4">
            Want hashtags for this offer? Ad-Genie will conjure 15–20 Instagram-ready tags.
          </p>
          <button
            onClick={() => setConfirming(true)}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-ag-border text-ag-fg-base text-sm font-semibold hover:bg-ag-bg-elevated transition-colors"
          >
            <Hash className="w-4 h-4" strokeWidth={1.5} /> Generate Hashtags
          </button>
        </div>
      )}
    </div>
  );
}
