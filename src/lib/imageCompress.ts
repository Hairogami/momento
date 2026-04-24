/**
 * Compression image côté client via Canvas + WebP.
 * Objectif : ramener toute photo à ≤ 1920px côté long, encodage WebP qualité 0.82.
 *
 * Une photo iPhone 4032×3024 (~5 MB JPEG) → ≈ 1920×1440 WebP ≈ 200-350 KB.
 * Pas de dépendance externe, utilise uniquement les APIs navigateur.
 */

type Options = {
  maxDimension?: number   // pixels (côté long) — défaut 1920
  quality?: number        // 0-1 — défaut 0.82
  mime?: "image/webp" | "image/jpeg" | "image/png" // défaut webp
}

const DEFAULT_MAX = 1920
const DEFAULT_QUALITY = 0.82

export async function compressImage(file: File, opts: Options = {}): Promise<File> {
  const maxDim = opts.maxDimension ?? DEFAULT_MAX
  const quality = opts.quality ?? DEFAULT_QUALITY
  const mime = opts.mime ?? "image/webp"

  // Fichier déjà petit → skip pour ne pas dégrader inutilement
  if (file.size < 300 * 1024 && file.type === mime) return file

  const bitmap = await loadBitmap(file)
  const { width, height } = fitWithin(bitmap.width, bitmap.height, maxDim)

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas 2D indisponible")
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close?.()

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error("Compression échouée"))), mime, quality)
  })

  // Si la compression a augmenté la taille (rare, petits fichiers déjà optimisés), garde l'original
  if (blob.size >= file.size) return file

  const ext = mime === "image/webp" ? "webp" : mime === "image/png" ? "png" : "jpg"
  const baseName = file.name.replace(/\.[a-zA-Z0-9]+$/, "") || "photo"
  return new File([blob], `${baseName}.${ext}`, { type: mime })
}

async function loadBitmap(file: File): Promise<ImageBitmap> {
  // ImageBitmap est plus rapide et évite les problèmes d'orientation EXIF sur iOS
  if (typeof createImageBitmap === "function") {
    return createImageBitmap(file, { imageOrientation: "from-image" }).catch(async () => {
      // Fallback si le navigateur ne supporte pas imageOrientation
      return createImageBitmap(file)
    })
  }
  // Très vieux navigateur : fallback sur Image + dataURL (moins robuste)
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const c = document.createElement("canvas")
      c.width = img.naturalWidth
      c.height = img.naturalHeight
      c.getContext("2d")?.drawImage(img, 0, 0)
      resolve(createImageBitmap(c))
    }
    img.onerror = () => reject(new Error("Lecture image impossible"))
    img.src = URL.createObjectURL(file)
  })
}

function fitWithin(w: number, h: number, maxDim: number): { width: number; height: number } {
  const longest = Math.max(w, h)
  if (longest <= maxDim) return { width: w, height: h }
  const ratio = maxDim / longest
  return { width: Math.round(w * ratio), height: Math.round(h * ratio) }
}
