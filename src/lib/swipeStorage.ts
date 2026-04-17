/**
 * Shared localStorage helpers for VendorSwipe (widget + modal).
 * Both components use the same keys so skipped/liked vendors sync.
 */

export const LS_LIKED   = (pid: string) => `momento_vsw_liked_${pid}`
export const LS_SKIPPED = (pid: string) => `momento_vsw_skipped_${pid}`

export function lsGet(key: string): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(key) ?? "[]") as string[]) }
  catch { return new Set() }
}

export function lsAdd(key: string, slug: string) {
  try { const s = lsGet(key); s.add(slug); localStorage.setItem(key, JSON.stringify([...s])) }
  catch {}
}

export function lsRemove(key: string, slug: string) {
  try { const s = lsGet(key); s.delete(slug); localStorage.setItem(key, JSON.stringify([...s])) }
  catch {}
}

export function lsClear(key: string) {
  try { localStorage.removeItem(key) } catch {}
}
