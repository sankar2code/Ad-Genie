'use client';

import { useState } from 'react';
import { Hash, Copy, Check, Sparkles } from 'lucide-react';
import GenieLamp from '@/components/icons/GenieLamp';
import { useToast } from '@/components/Toast';

export default function HashtagPanel({ offer, userId }) {
  const [confirming, setConfirming]   = useState(false);
  const [loading, setLoading]         = useState(false);
  const [hashtags, setHashtags]       = useState(null);
  const [hashtagSetId, setHashtagSetId] = useState(null);
  const [copied, setCopied]           = useState(false);
  const [error, setError]             = useState('');
  const showToast = useToast();

  async function handleGenerate() {
    setLoading(true);
    setError('');
    try {
      const res  = await fetch('/api/hashtags', {
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

  async function handleCopyAll() {
    await navigator.clipboard.writeText(hashtags.join(' '));
    setCopied(true);
    showToast('Hashtags conjured and copied!', 'genie');
    logCopyAll();
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-2xl p-6 ag-glass border border-ag-border"
      style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.4)' }}>

      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(20,184,166,0.15)', border: '1px solid rgba(20,184,166,0.3)' }}>
          <Hash className="w-4 h-4 text-ag-genie" strokeWidth={1.5} />
        </div>
        <h2 className="font-display text-base font-semibold text-ag-fg-base">Hashtags</h2>
      </div>

      {error && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl mb-4 text-sm"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#FCA5A5' }}>
          {error}
        </div>
      )}

      {hashtags ? (
        <div className="ag-fade-in">
          {/* Tag cloud */}
          <div className="flex flex-wrap gap-2 mb-4">
            {hashtags.map((tag, i) => (
              <button
                key={tag}
                onClick={() => {
                  navigator.clipboard.writeText(tag);
                  showToast(`Copied ${tag}`, 'genie', 1500);
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-full transition-all hover:scale-105 active:scale-95"
                style={{
                  background: i % 2 === 0 ? 'rgba(20,184,166,0.1)' : 'rgba(139,92,246,0.1)',
                  border: `1px solid ${i % 2 === 0 ? 'rgba(20,184,166,0.25)' : 'rgba(139,92,246,0.25)'}`,
                  color: i % 2 === 0 ? '#14B8A6' : '#A78BFA',
                  animationDelay: `${i * 30}ms`,
                }}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Copy all */}
          <button
            onClick={handleCopyAll}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
            style={copied ? {
              background: 'rgba(16,185,129,0.15)',
              border: '1px solid rgba(16,185,129,0.3)',
              color: '#10B981',
            } : {
              background: 'rgba(20,184,166,0.1)',
              border: '1px solid rgba(20,184,166,0.25)',
              color: '#14B8A6',
            }}
          >
            {copied
              ? <><Check className="w-4 h-4" strokeWidth={2} /> Copied to clipboard!</>
              : <><Copy className="w-4 h-4" strokeWidth={1.5} /> Copy all {hashtags.length} hashtags</>
            }
          </button>
        </div>
      ) : confirming ? (
        <div>
          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center py-6 mb-4 rounded-xl"
              style={{ background: 'rgba(20,184,166,0.05)', border: '1px solid rgba(20,184,166,0.15)' }}>
              <GenieLamp size={52} className="ag-float mb-3" />
              <p className="text-ag-genie font-semibold text-sm">Conjuring hashtags…</p>
              <p className="text-ag-fg-muted text-xs mt-1">The Genie is finding the perfect tags</p>
              <div className="mt-3 w-24 h-0.5 rounded-full overflow-hidden"
                style={{ background: 'rgba(20,184,166,0.15)' }}>
                <div className="h-full rounded-full"
                  style={{ background: '#14B8A6', animation: 'agShimmer 1.5s ease-in-out infinite', width: '60%' }} />
              </div>
            </div>
          )}

          {!loading && (
            <p className="text-ag-fg-subtle text-sm mb-4">
              Conjure 15–20 Instagram-ready hashtags for this offer?
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
              style={{ background: 'rgba(20,184,166,0.15)', border: '1px solid rgba(20,184,166,0.35)', color: '#14B8A6' }}
            >
              {loading
                ? <><span className="w-4 h-4 rounded-full border-2 border-ag-genie border-t-transparent animate-spin" /> Conjuring…</>
                : <><Sparkles className="w-4 h-4" /> Conjure hashtags</>
              }
            </button>
            {!loading && (
              <button
                onClick={() => setConfirming(false)}
                className="px-4 py-2.5 rounded-xl border border-ag-border text-ag-fg-subtle text-sm hover:text-ag-fg-base hover:border-ag-border-strong transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      ) : (
        <div>
          {/* Idle state */}
          <div className="flex flex-col items-center py-6 mb-4 rounded-xl"
            style={{ background: 'rgba(20,184,166,0.04)', border: '1px dashed rgba(20,184,166,0.18)' }}>
            <GenieLamp size={48} className="mb-3 opacity-70" />
            <p className="text-ag-fg-muted text-xs text-center max-w-[180px] leading-relaxed">
              Ad-Genie will conjure 15–20 perfect Instagram hashtags for this offer
            </p>
          </div>
          <button
            onClick={() => setConfirming(true)}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-ag-border text-ag-fg-base text-sm font-semibold hover:border-ag-border-strong hover:bg-ag-bg-elevated transition-all"
          >
            <Hash className="w-4 h-4 text-ag-genie" strokeWidth={1.5} /> Generate Hashtags
          </button>
        </div>
      )}
    </div>
  );
}
