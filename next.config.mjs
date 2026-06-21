import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow profile photos from Supabase Storage and AI-generated poster URLs.
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      // OpenAI returns temporary hosted URLs for generated posters
      { protocol: 'https', hostname: 'oaidalleapiprodscus.blob.core.windows.net' },
    ],
  },
  // instrumentationHook enables instrumentation.js for Sentry server/edge init.
  // Supported on both Netlify and local dev with Next.js 14.
  experimental: {
    instrumentationHook: true,
  },
};

// withSentryConfig is a no-op when SENTRY_AUTH_TOKEN / org / project are not set —
// source map upload is skipped and a warning is logged. Safe on all environments.
export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  widenClientFileUpload: true,
});
