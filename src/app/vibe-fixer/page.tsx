import { HeroSection } from "@/components/sections/hero";
import { AudienceSection } from "@/components/sections/audience";
import { WhatYouGetSection } from "@/components/sections/what-you-get";
import { Footer } from "@/components/sections/footer";
import { PricingSection } from "@/components/sections/pricing";
import { WhySection } from "@/components/sections/why";
import { FAQSection } from "@/components/sections/faq";
import { CtaSection } from "@/components/sections/cta";
import { HeroScrollProvider } from "@/components/sections/hero-scroll-context";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vibe Fixer | tonik",
  description: "Vibe coding builds fast but breaks faster. We clean up the code, remove the chaos, fix regressions, and get your team shipping fast again.",
  openGraph: {
    title: "Fix Your Vibe-Coded Mess & Ship Fast Again | tonik",
    description: "Vibe coding builds fast but breaks faster. We clean up the code, remove the chaos, fix regressions, and get your team shipping fast again.",
    url: "https://vibefixer.tonik.com",
    siteName: "tonik",
  }
}

export default function VibeCleanerPage() {
  return (
    <HeroScrollProvider>
      <div className="flex min-h-screen w-full items-start justify-center gap-2 bg-off-black px-6 pt-10">
        <div className="flex w-full flex-col items-center">
          <HeroSection />
          <AudienceSection />
          <WhatYouGetSection />
          <WhySection />
          <PricingSection />
          <FAQSection />
          <CtaSection />
          <Footer />
        </div>
      </div>
    </HeroScrollProvider>
  );
}
