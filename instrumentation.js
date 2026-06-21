// Sentry init for the Node.js and Edge runtimes. Requires
// experimental.instrumentationHook in next.config.mjs on Next.js 14 — see
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

export async function register() {
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

  if (process.env.NEXT_RUNTIME === 'nodejs' || process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({ dsn, tracesSampleRate: 0.1 });
  }
}

export const onRequestError = Sentry.captureRequestError;
