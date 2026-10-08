import { Metadata } from "next";
import { HeroScrollProvider } from "@/components/sections/hero-scroll-context";
import { Footer } from "@/components/sections/footer";
import { SanityHero } from "@/components/sanity/hero";
import { SanityHowItWorks } from "@/components/sanity/how-it-works";
import { SanityExamples } from "@/components/sanity/examples";
import { SanityWhatChanges } from "@/components/sanity/what-changes";
import { SanityMigration } from "@/components/sanity/migration";
import { SanityNeedGet, SanityPricing } from "@/components/sanity/pricing";
import { SanityCta } from "@/components/sanity/cta";
import { SanityCaseStudy, SanityToolkit, SanityWhyTonik } from "@/components/sanity/tonik-sections";
import { NoOrphans } from "@/components/sanity/typography";

export const metadata: Metadata = {
  title: "Launch on-brand pages without waiting on developers | tonik",
  description:
    "Launch new pages without waiting on developers. Your team describes what it needs, gets an on-brand draft, and publishes through your usual approvals. We build the whole system for you on Sanity.",
};

export default function SanityPage() {
  return (
    <HeroScrollProvider>
      <div className="flex min-h-screen w-full items-start justify-center gap-2 bg-off-black px-6 pt-10">
        {/* balanced wrapping on headings and body copy, no short words hanging at line ends */}
        <NoOrphans className="flex w-full flex-col items-center [&_.text-2xl]:text-balance [&_.text-3xl]:text-balance [&_.text-4xl]:text-balance [&_h1]:text-balance [&_p]:text-balance [&_li]:text-balance">
          <SanityHero />
          <SanityWhyTonik />
          <SanityHowItWorks />
          <SanityExamples />
          <SanityCaseStudy />
          <SanityWhatChanges />
          <SanityMigration />
          <SanityToolkit />
          <SanityNeedGet />
          <SanityPricing />
          <SanityCta />
          <Footer />
        </NoOrphans>
      </div>
    </HeroScrollProvider>
  );
}
