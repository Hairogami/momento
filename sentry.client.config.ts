/**
 * Sentry browser SDK init
 * Loaded automatically in client bundles by @sentry/nextjs.
 */
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Disable in development to avoid noise / quota usage
  enabled: process.env.NODE_ENV === "production",

  // Performance monitoring — sample 10% of transactions in prod
  tracesSampleRate: 0.1,

  // Session replay — capture 10% of sessions, 100% of those with errors
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Don't send PII unless we explicitly attach it
  sendDefaultPii: false,

  // Filter known noisy errors
  ignoreErrors: [
    // Browser extensions
    "top.GLOBALS",
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications",
    // Network errors that are user-side
    "Network request failed",
    "Failed to fetch",
    "NetworkError",
    "Load failed",
  ],

  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: true,
    }),
  ],
})
