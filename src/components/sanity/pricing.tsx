"use client";

import { Separator } from "@/components/ui/separator";
import { List, ListItem } from "@/components/ui/list-item";
import { Reveal, SectionLabel } from "./shared";

/** Same anatomy as the Vibe Fixer PricingCard (border, p-10, gap-y-6, title 3xl, price xl, connected list). */
function PricingCard({ duration, title, description, price, features }: { duration: string; title: string; description: string; price: string; features: string[] }) {
  return (
    <div className="grid h-full flex-1 grid-cols-1 content-start items-start justify-items-start gap-4 gap-y-6 border border-dark-grey p-6 md:grid-cols-2 md:p-10 lg:grid-cols-1">
      <div className="flex w-full flex-col gap-4">
        <div className="grid w-full grid-rows-[auto_auto_calc(var(--spacing)*12)] gap-2">
          <p className="font-mono text-sm uppercase leading-none tracking-tight text-off-white">{duration}</p>
          <p className="font-sans text-3xl text-off-white">{title}</p>
          <p className="text-base leading-6 text-off-white-light">{description}</p>
        </div>
        <Separator className="invisible" />
        <div className="flex w-full flex-col gap-1 text-off-white">
          <p className="font-mono text-sm uppercase leading-none tracking-tight">From</p>
          <p className="text-xl leading-7">{price}</p>
        </div>
        <Separator />
      </div>
      <List>
        {features.map((f) => (
          <ListItem key={f}>{f}</ListItem>
        ))}
      </List>
    </div>
  );
}

/** V1 section 07 — "What we need and what you get", restored with its own label. */
export function SanityNeedGet() {
  return (
    <section className="flex w-full max-w-container-6xl flex-col gap-[120px] pb-[120px]">
      <SectionLabel>What we need and what you get</SectionLabel>
      <div className="grid w-full grid-cols-1 gap-16 lg:grid-cols-[420px_1fr_1fr]">
        <Reveal className="flex flex-col gap-3">
          <p className="text-3xl leading-10 text-off-white">
            Bring your website. <span className="text-off-white-light">Leave with a system built to grow.</span>
          </p>
          <p className="text-base leading-6 text-off-white-light">We turn your current site into a code-based Sanity setup your team owns.</p>
        </Reveal>
        <Reveal delay={0.08} className="flex flex-col gap-6">
          <p className="text-base leading-6">
            What we need from you <span className="text-off-white-light">— Your current setup and priorities.</span>
          </p>
          <List>
            <ListItem>Access to your current CMS or website code</ListItem>
            <ListItem>The external systems you want to connect</ListItem>
          </List>
        </Reveal>
        <Reveal delay={0.16} className="flex flex-col gap-6">
          <p className="text-base leading-6">
            What you get <span className="text-off-white-light">— A working system your team can use.</span>
          </p>
          <List>
            <ListItem>A ready-to-use repo with a clear visual system</ListItem>
            <ListItem>Sanity CMS with reusable page sections</ListItem>
            <ListItem>Preview and deployment workflows</ListItem>
            <ListItem>Conversational workflow through MCP, plus handover</ListItem>
          </List>
        </Reveal>
      </div>
    </section>
  );
}

export function SanityPricing() {
  return (
    <section className="flex w-full max-w-container-6xl flex-col gap-[120px] pb-[120px]">
      <SectionLabel>Ballpark pricing · $150/hour</SectionLabel>
      <div className="flex w-full flex-col gap-16">
        <div className="-mx-6 flex snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto px-6 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-1 md:overflow-visible md:px-0 lg:grid-cols-2 [&::-webkit-scrollbar]:hidden">
          <Reveal className="w-[85%] shrink-0 snap-start md:w-auto">
            <PricingCard
              duration="From 24 hours"
              title="Focused site setup"
              description="For a marketing website with a few core pages and a clear content structure."
              price="$3,600"
              features={["A focused set of core marketing pages", "Ready-to-use frontend repository", "Sanity CMS and reusable sections", "Preview and deployment workflow", "Conversational workflow through MCP"]}
            />
          </Reveal>
          <Reveal delay={0.08} className="w-[85%] shrink-0 snap-start md:w-auto">
            <PricingCard
              duration="From 8 weeks"
              title="Large content migration"
              description="For moving up to 2,000 pages without stopping the current website."
              price="$24,000"
              features={["Content audit and final estimate", "Up to 2,000 pages", "Repeatable migration scripts", "Incremental imports with no content freeze", "Content mapping, validation, and staging"]}
            />
          </Reveal>
        </div>
        <Reveal>
          <p className="text-base leading-6 text-off-white-light">
            These are ballpark estimates. Contact us for a detailed quote based on your content, integrations, and timeline.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
