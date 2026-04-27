/**
 * Next.js instrumentation — Sentry init + error monitoring.
 * Doc: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

import * as Sentry from "@sentry/nextjs"

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config")

    // Capture unhandled promise rejections côté serveur
    process.on("unhandledRejection", (reason: unknown, promise: Promise<unknown>) => {
      console.error("[instrumentation] Unhandled rejection at:", promise, "reason:", reason)
      if (process.env.NODE_ENV === "production") {
        Sentry.captureException(reason, { extra: { source: "unhandledRejection" } })
      }
    })

    // Capture exceptions non catchées
    process.on("uncaughtException", (error: Error) => {
      console.error("[instrumentation] Uncaught exception:", error.message, error.stack)
      if (process.env.NODE_ENV === "production") {
        Sentry.captureException(error, { extra: { source: "uncaughtException" } })
      }
    })
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config")
  }
}

/**
 * onRequestError — hook Next.js 15+ pour capturer les erreurs de rendu.
 * Appelé automatiquement pour chaque erreur de page/route.
 */
export const onRequestError = Sentry.captureRequestError
