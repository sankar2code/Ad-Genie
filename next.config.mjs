import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  // Required on Next.js 14 for instrumentation.js (Sentry server/edge init) to load.
  experimental: {
    instrumentationHook: true,
  },
};

// withSentryConfig is safe to apply even without SENTRY_AUTH_TOKEN/org/project
// set — source map upload is simply skipped and a warning is logged.
export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  widenClientFileUpload: true,
  webpack: { treeshake: { removeDebugLogging: true } },
});
