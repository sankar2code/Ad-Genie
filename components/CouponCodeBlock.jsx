'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function CouponCodeBlock({ code, onCopy }) {
  const [copied, setCopied] = useState(false);
  const showToast = useToast();

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      showToast('✨ Code copied! Head to checkout.', 'genie');
      onCopy?.();
    } catch {
      showToast('Could not copy — try selecting the code manually.', 'error');
    }
  }

  return (
    <div className="bg-ag-bg-elevated border border-dashed border-[rgba(212,175,55,0.40)] rounded-xl p-6 mb-5 text-center">
      <p className="text-ag-fg-muted text-xs uppercase tracking-widest mb-3">Coupon code</p>
      <p className="font-mono text-2xl font-medium text-ag-accent tracking-[0.12em] mb-5">
        {code}
      </p>
      <button
        onClick={handleCopy}
        className="ag-shimmer inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-ag-accent text-ag-fg-inverted font-semibold text-sm hover:bg-ag-accent-hover transition-colors"
      >
        {copied ? <Check className="w-4 h-4" strokeWidth={2} /> : <Copy className="w-4 h-4" strokeWidth={1.5} />}
        {copied ? 'Code copied!' : 'Copy code'}
      </button>
    </div>
  );
}
