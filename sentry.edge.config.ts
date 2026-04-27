/**
 * Sentry Edge runtime SDK init
 * Loaded by instrumentation.ts when NEXT_RUNTIME === "edge".
 * Used for middleware (proxy.ts) and Edge route handlers.
 */
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Disable in development to avoid noise / quota usage
  enabled: process.env.NODE_ENV === "production",

  // Performance monitoring — sample 10% of transactions in prod
  tracesSampleRate: 0.1,

  // Don't send PII unless we explicitly attach it
  sendDefaultPii: false,
})
