// Sentry init for the browser. Next.js loads this file automatically — see
// https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation-client
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  // Sentry.init with no dsn is a documented no-op — safe to leave unset locally.
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
