"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface FullscreenModalContextValue {
  active: boolean
  setActive: (active: boolean) => void
}

const Ctx = createContext<FullscreenModalContextValue>({ active: false, setActive: () => {} })

/**
 * Provider monté au layout root pour signaler qu'une modal fullscreen
 * (ex: VendorSwipe) est ouverte. Les éléments mobile fixes (bottom nav)
 * peuvent se masquer en lisant `useFullscreenModal().active`.
 */
export function FullscreenModalProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false)
  return <Ctx.Provider value={{ active, setActive }}>{children}</Ctx.Provider>
}

/**
 * Hook lecture seule pour les consommateurs (ex: MobileDashNav).
 */
export function useFullscreenModal() {
  return useContext(Ctx)
}

/**
 * Hook impératif : déclare la modal active pendant la durée de vie du composant
 * appelant. À utiliser dans les modals fullscreen mobile (VendorSwipe, etc.).
 */
export function useDeclareFullscreen(active: boolean) {
  const { setActive } = useContext(Ctx)
  useEffect(() => {
    if (!active) return
    setActive(true)
    return () => setActive(false)
  }, [active, setActive])
}
