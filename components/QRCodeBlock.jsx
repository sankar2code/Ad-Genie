'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function QRCodeBlock({ value }) {
  const [dataUrl, setDataUrl] = useState(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value || 'https://ad-genie.app', {
      width: 240,
      margin: 1,
      color: { dark: '#0D0B1E', light: '#FFFFFF' },
    })
      .then(url => { if (!cancelled) setDataUrl(url); })
      .catch(err => console.error('QR generation failed:', err));
    return () => { cancelled = true; };
  }, [value]);

  return (
    <div className="bg-ag-bg-elevated border border-ag-border rounded-xl p-6 mb-5 text-center">
      <p className="text-ag-fg-muted text-xs uppercase tracking-widest mb-4">Show at checkout</p>
      <div className="inline-flex items-center justify-center bg-white rounded-xl p-5 mb-3 w-[240px] h-[240px]">
        {dataUrl ? (
          <img src={dataUrl} alt="Redemption QR code" width={240} height={240} />
        ) : (
          <div className="w-[200px] h-[200px] bg-ag-bg-elevated/20 animate-pulse rounded" />
        )}
      </div>
      <p className="text-xs text-ag-fg-muted italic">Increase screen brightness for best scan results ✨</p>
    </div>
  );
}
