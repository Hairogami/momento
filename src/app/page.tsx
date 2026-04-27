import AntNav from "@/components/clone/AntNav"
import AntHero from "@/components/clone/AntHero"
import AntVideoSection from "@/components/clone/AntVideoSection"
import AntAgentFirst from "@/components/clone/AntAgentFirst"
import AntFeatureExplorer from "@/components/clone/AntFeatureExplorer"
import AntUseCases from "@/components/clone/AntUseCases"
import AntTestimonials from "@/components/clone/AntTestimonials"
import AntPricing from "@/components/clone/AntPricing"
import AntDownload from "@/components/clone/AntDownload"
import AntFooter from "@/components/clone/AntFooter"

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
