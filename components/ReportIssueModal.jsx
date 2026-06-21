'use client';

import { useEffect, useRef, useState } from 'react';
import { Flag } from 'lucide-react';
import { useFocusTrap } from '@/lib/useFocusTrap';

const REASONS = [
  'Coupon code didn\'t work',
  'Discount is wrong or expired',
  'QR code wouldn\'t scan',
  'Offer details are inaccurate',
  'Something else',
];

export default function ReportIssueModal({ onSubmit, onClose }) {
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState('');
  const dialogRef = useRef(null);

  useFocusTrap(dialogRef, { onEscape: onClose });

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ reason, details });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-issue-title"
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
        className="ag-genie-reveal w-full max-w-sm bg-ag-bg-elevated border border-ag-border-strong rounded-xl p-6"
      >
        <div className="flex items-center gap-2 mb-2">
          <Flag className="w-4 h-4 text-ag-error" strokeWidth={1.5} />
          <h2 id="report-issue-title" className="font-display text-lg font-semibold text-ag-fg-base">Report an issue</h2>
        </div>
        <p className="text-ag-fg-subtle text-sm mb-4">
          Let us know what went wrong with this offer.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="report-reason" className="sr-only">Reason</label>
            <select
              id="report-reason"
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-ag-bg-base border border-ag-border text-ag-fg-base text-sm focus:outline-none focus:border-ag-border-strong"
            >
              {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="report-details" className="sr-only">Additional details (optional)</label>
            <textarea
              id="report-details"
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="Additional details (optional)"
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-lg bg-ag-bg-base border border-ag-border text-ag-fg-base placeholder:text-ag-fg-muted text-sm focus:outline-none focus:border-ag-border-strong resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 h-10 rounded-lg bg-ag-error/90 text-white font-semibold text-sm hover:bg-ag-error transition-colors"
            >
              Submit report
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 h-10 rounded-lg border border-ag-border text-ag-fg-subtle text-sm hover:text-ag-fg-base transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
