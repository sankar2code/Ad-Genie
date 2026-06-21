'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { useFocusTrap } from '@/lib/useFocusTrap';

export default function ZipFallbackModal({ defaultZip = '', onSubmit }) {
  const [zip, setZip] = useState(defaultZip);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const dialogRef = useRef(null);

  useFocusTrap(dialogRef);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (!/^\d{5}$/.test(zip)) {
      setError('Enter a valid 5-digit zip code.');
      return;
    }
    setError('');
    onSubmit(zip);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="zip-modal-title"
        className="ag-genie-reveal w-full max-w-sm bg-ag-bg-elevated border border-ag-border-strong rounded-xl p-6"
      >
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-ag-accent" strokeWidth={1.5} />
          <h2 id="zip-modal-title" className="font-display text-lg font-semibold text-ag-fg-base">Where are you shopping?</h2>
        </div>
        <p className="text-ag-fg-subtle text-sm mb-4">
          Location access lets us show your nearest deals. You can also enter a zip code.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <label htmlFor="zip-input" className="sr-only">Zip code</label>
          <input
            ref={inputRef}
            id="zip-input"
            type="text"
            inputMode="numeric"
            maxLength={5}
            value={zip}
            onChange={e => setZip(e.target.value.replace(/\D/g, ''))}
            placeholder="90210"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'zip-error' : undefined}
            className="w-full h-10 px-3.5 rounded-lg bg-ag-bg-base border border-ag-border text-ag-fg-base placeholder:text-ag-fg-muted text-sm focus:outline-none focus:border-ag-border-strong focus:shadow-[0_0_0_3px_rgba(212,175,55,0.12)]"
          />
          {error && <p id="zip-error" role="alert" className="text-ag-error text-xs">{error}</p>}
          <button
            type="submit"
            className="w-full h-10 rounded-lg bg-ag-accent text-ag-fg-inverted font-semibold text-sm hover:bg-ag-accent-hover transition-colors"
          >
            Show deals
          </button>
        </form>
      </div>
    </div>
  );
}
