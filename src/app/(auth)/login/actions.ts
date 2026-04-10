"use server";

/**
 * registerAction — REMOVED (C01/I03).
 * Remplacé par un appel direct à /api/auth/register depuis les composants client.
 * Ce Server Action n'avait pas de rate-limit, pas d'envoi d'email de vérification,
 * et créait des comptes zombies jamais activables.
 *
 * Utiliser à la place :
 *   const res = await fetch("/api/auth/register", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify({ role, email, password, firstName, lastName }),
 *   })
 */
export async function registerAction(_args: {
  name?: string;
  email: string;
  password: string;
}) {
  // Redirect callers to the API route — this action is intentionally a no-op.
  return { error: "Utilisez /api/auth/register directement." };
}
