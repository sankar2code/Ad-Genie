'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          background: '#0D0B1E',
          color: '#F5EDD6',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          padding: '1.5rem',
        }}>
          <p style={{ fontSize: '2rem' }}>🪔</p>
          <p style={{ fontSize: '1.25rem' }}>Even magic needs a signal</p>
          <p style={{ fontSize: '0.875rem', color: '#A89B7A' }}>Something went wrong. Try again.</p>
          <button
            onClick={() => reset()}
            style={{
              background: '#D4AF37',
              color: '#0D0B1E',
              fontWeight: 600,
              padding: '0.625rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
