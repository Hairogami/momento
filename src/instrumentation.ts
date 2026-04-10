/**
 * Next.js instrumentation — error monitoring basique.
 * Active sur Node.js runtime (server-side).
 * Remplace Sentry jusqu'à intégration complète.
 * Doc: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Capture unhandled promise rejections côté serveur
    process.on("unhandledRejection", (reason: unknown, promise: Promise<unknown>) => {
      console.error("[instrumentation] Unhandled rejection at:", promise, "reason:", reason)
    })

    // Capture exceptions non catchées
    process.on("uncaughtException", (error: Error) => {
      console.error("[instrumentation] Uncaught exception:", error.message, error.stack)
    })
  }
}

/**
 * onRequestError — hook Next.js 15+ pour capturer les erreurs de rendu.
 * Appelé automatiquement pour chaque erreur de page/route.
 */
export function onRequestError(
  err: { digest?: string } & Error,
  request: { path: string; method: string },
  context: { routerKind: string; routePath?: string; routeType?: string },
) {
  // En production, log structuré pour Vercel Log Drains / future intégration Sentry
  if (process.env.NODE_ENV === "production") {
    console.error(
      JSON.stringify({
        level: "error",
        source: "request",
        message: err.message,
        digest: err.digest,
        path: request.path,
        method: request.method,
        routePath: context.routePath,
        routeType: context.routeType,
        timestamp: new Date().toISOString(),
      }),
    )
  }
}
