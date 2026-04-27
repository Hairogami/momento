/**
 * Observability helper — wraps Sentry capture with dev fallback.
 *
 * Usage:
 *   import { captureError } from "@/lib/observability"
 *   try { ... } catch (err) {
 *     captureError(err, { route: "/api/foo", userId: session?.user?.id })
 *     return new Response("Internal Server Error", { status: 500 })
 *   }
 *
 * In production: forwards to Sentry with extra context.
 * In development: prints to console with [dev] prefix (no Sentry quota usage).
 */
import * as Sentry from "@sentry/nextjs"

export type ErrorContext = Record<string, unknown>

export function captureError(error: unknown, context?: ErrorContext) {
  if (process.env.NODE_ENV === "production") {
    Sentry.captureException(error, context ? { extra: context } : undefined)
  } else {
    // eslint-disable-next-line no-console
    console.error("[dev]", error, context ?? "")
  }
}

/**
 * Capture a non-error message (e.g. unexpected state, security alert).
 * Use sparingly — prefer captureError when an actual exception is involved.
 */
export function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "warning",
  context?: ErrorContext,
) {
  if (process.env.NODE_ENV === "production") {
    Sentry.captureMessage(message, { level, extra: context })
  } else {
    // eslint-disable-next-line no-console
    console[level === "error" ? "error" : "warn"](`[dev] ${message}`, context ?? "")
  }
}
