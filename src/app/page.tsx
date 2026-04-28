import dynamic from "next/dynamic"
import AntNav from "@/components/clone/AntNav"
import AntHero from "@/components/clone/AntHero"
import AntFooter from "@/components/clone/AntFooter"

// Below-the-fold sections : dynamic-imported pour réduire le JS bloquant le LCP mobile.
// Tous sont "use client" et apparaissent après le hero — pas besoin pour le first paint.
// loading="null" + ssr default true pour conserver SSR (HTML initial), seul le JS est différé.
const AntVideoSection   = dynamic(() => import("@/components/clone/AntVideoSection"))
const AntUseCases       = dynamic(() => import("@/components/clone/AntUseCases"))
const AntFeatureExplorer = dynamic(() => import("@/components/clone/AntFeatureExplorer"))
const AntAgentFirst     = dynamic(() => import("@/components/clone/AntAgentFirst"))
const AntTestimonials   = dynamic(() => import("@/components/clone/AntTestimonials"))
const AntPricing        = dynamic(() => import("@/components/clone/AntPricing"))
const AntDownload       = dynamic(() => import("@/components/clone/AntDownload"))

export default function ClonePage() {
  return (
    <div className="ant-root" style={{ backgroundColor: "var(--dash-bg,#fff)", color: "var(--dash-text,#121317)" }}>
      <AntNav animateInDelay={1200} />
      <main id="main-content">
        <AntHero />
        <AntVideoSection />
        <AntUseCases />
        <AntFeatureExplorer />
        <AntAgentFirst />
        <AntTestimonials />
        <AntPricing />
        <AntDownload />
      </main>
      <AntFooter />
    </div>
  )
}
