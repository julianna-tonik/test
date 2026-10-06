"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { List, ListItem } from "@/components/ui/list-item";

/**
 * Directions for the three static sections (Where it can go · What we need / what you get · Pricing).
 * Copy is V1 word for word; only the presentation changes.
 */

const ease = [0.65, 0, 0.35, 1] as const;

/* ── copy (V1) ── */
const WHERE = {
  title: "Start with pages.",
  rest: "Expand when it makes sense.",
  sub: "The same workflow can support more of your content operations.",
  items: [
    ["Create pages from familiar tools.", "Start a request in Slack, Claude, Codex, or another tool."],
    ["Handle repetitive work.", "Manage translations, metadata, and bulk updates."],
    ["Connect external systems.", "Add analytics, CRM, translation, or internal tools."],
  ],
};
const NEED = {
  title: "Bring your website.",
  rest: "Leave with a system built to grow.",
  sub: "We turn your current site into a code-based Sanity setup your team owns.",
  need: { label: "What we need from you", note: "Your current setup and priorities.", items: ["Access to your Webflow project or website code", "The external systems you want to connect"] },
  get: { label: "What you get", note: "A working system your team can use.", items: ["A ready-to-use repo with a clear visual system", "Sanity CMS with reusable page sections", "Preview and deployment workflows", "Conversational workflow through MCP, plus handover"] },
};
const PLANS = [
  {
    duration: "From 24 hours",
    title: "Focused site setup",
    description: "For a marketing website with a few core pages and a clear content structure.",
    price: "$3,600",
    features: ["A focused set of core marketing pages", "Ready-to-use frontend repository", "Sanity CMS and reusable sections", "Preview and deployment workflow", "Conversational workflow through MCP"],
  },
  {
    duration: "From 8 weeks",
    title: "Large content migration",
    description: "For moving up to 2,000 pages without stopping the current website.",
    price: "$24,000",
    features: ["Content audit and final estimate", "Up to 2,000 pages", "Repeatable migration scripts", "Incremental imports with no content freeze", "Content mapping, validation, and staging"],
  },
];
const PRICING_NOTE = "These are ballpark estimates. Contact us for a detailed quote based on your content, integrations, and timeline.";

const Mono = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <p className={cn("font-mono text-sm uppercase leading-none tracking-tight", className)}>{children}</p>
);
const Heading = ({ a, b }: { a: string; b: string }) => (
  <p className="text-3xl leading-10 text-off-white">
    {a} <span className="text-off-white-light">{b}</span>
  </p>
);

/* ═══════════════ WHERE IT CAN GO ═══════════════ */

/** W1 · Branches: one stem from "pages", three branches light up one after another. */
export function WhereBranches() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  return (
    <div ref={ref} className="grid w-full grid-cols-1 gap-16 lg:grid-cols-[420px_1fr]">
      <div className="flex flex-col gap-3">
        <Heading a={WHERE.title} b={WHERE.rest} />
        <p className="text-base leading-6 text-off-white-light">{WHERE.sub}</p>
      </div>
      <div className="relative flex flex-col gap-10 pl-10">
        {/* stem */}
        <div className="absolute bottom-6 left-[5px] top-[5px] w-px bg-dark-grey">
          <motion.div className="absolute inset-0 origin-top bg-off-white" initial={{ scaleY: 0 }} animate={{ scaleY: inView ? 1 : 0 }} transition={{ duration: 2.4, ease }} />
        </div>
        <div className="relative flex items-center gap-4">
          <span className="absolute -left-10 top-1/2 size-[11px] -translate-y-1/2 bg-off-white" />
          <Mono className="text-off-white">{WHERE.title}</Mono>
        </div>
        {WHERE.items.map(([a, b], i) => (
          <motion.div
            key={a}
            className="relative flex flex-col"
            initial={{ opacity: 0.25 }}
            animate={{ opacity: inView ? 1 : 0.25 }}
            transition={{ duration: 0.6, delay: 0.6 + i * 0.7 }}
          >
            <span className="absolute -left-[34px] top-3 h-px w-[15px] bg-dark-grey" />
            <motion.span
              className="absolute -left-[19px] top-[7px] size-[11px] border border-off-white"
              initial={{ backgroundColor: "rgba(239,239,239,0)" }}
              animate={{ backgroundColor: inView ? "rgba(239,239,239,1)" : "rgba(239,239,239,0)" }}
              transition={{ duration: 0.4, delay: 0.8 + i * 0.7 }}
            />
            <p className="text-xl leading-7 text-off-white">{a}</p>
            <p className="text-base leading-6 text-off-white-light">{b}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/** W2 · Stages: a line runs left → right through the start and three later stages. */
export function WhereStages() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const cols = [[WHERE.title, WHERE.sub], ...WHERE.items];
  return (
    <div ref={ref} className="flex w-full flex-col gap-16">
      <Heading a={WHERE.title} b={WHERE.rest} />
      <div className="grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-8">
        {cols.map(([a, b], i) => (
          <div key={a} className="flex flex-col gap-6">
            <div className="relative flex items-center">
              <motion.span
                className="relative z-10 size-[11px] border border-off-white"
                initial={{ backgroundColor: "rgba(239,239,239,0)" }}
                animate={{ backgroundColor: inView ? "rgba(239,239,239,1)" : "rgba(239,239,239,0)" }}
                transition={{ duration: 0.3, delay: 0.2 + i * 0.6 }}
              />
              {i < cols.length - 1 && (
                <div className="absolute left-[11px] right-[-32px] hidden h-px bg-dark-grey md:block">
                  <motion.div className="absolute inset-0 origin-left bg-off-white" initial={{ scaleX: 0 }} animate={{ scaleX: inView ? 1 : 0 }} transition={{ duration: 0.6, delay: 0.3 + i * 0.6, ease }} />
                </div>
              )}
              <Mono className="ml-4 text-off-white-light">{i === 0 ? "Now" : `+${String(i).padStart(2, "0")}`}</Mono>
            </div>
            <div className="flex flex-col">
              <p className="text-base leading-6 text-off-white">{a}</p>
              <p className="text-base leading-6 text-off-white-light">{b}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════ WHAT WE NEED / WHAT YOU GET ═══════════════ */

/** Small VF square grid that fills cell by cell — the "system" being built. */
function Assembling({ on }: { on: boolean }) {
  const cells = Array.from({ length: 24 }, (_, i) => i);
  return (
    <div className="grid grid-cols-6 gap-px border border-dark-grey bg-dark-grey p-px">
      {cells.map((i) => (
        <motion.span
          key={i}
          className="aspect-square"
          initial={{ backgroundColor: "#212121" }}
          animate={{ backgroundColor: on ? (i % 7 === 3 ? "#5a5a5a" : "#2c2c2c") : "#212121" }}
          transition={{ duration: 0.3, delay: 0.6 + ((i * 7) % 24) * 0.06 }}
        />
      ))}
    </div>
  );
}

/** N1 · Pipeline: what you bring flows through the build into what you get. */
export function NeedPipeline() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  return (
    <div ref={ref} className="flex w-full flex-col gap-16">
      <div className="flex max-w-[640px] flex-col gap-3">
        <Heading a={NEED.title} b={NEED.rest} />
        <p className="text-base leading-6 text-off-white-light">{NEED.sub}</p>
      </div>
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_auto_160px_auto_1fr]">
        <div className="flex flex-col gap-6">
          <p className="text-base leading-6">{NEED.need.label} <span className="text-off-white-light">— {NEED.need.note}</span></p>
          <List>{NEED.need.items.map((t) => <ListItem key={t}>{t}</ListItem>)}</List>
        </div>
        <Flow on={inView} delay={0} />
        <div className="mx-auto w-[160px]"><Assembling on={inView} /></div>
        <Flow on={inView} delay={1.4} />
        <motion.div className="flex flex-col gap-6" initial={{ opacity: 0.3 }} animate={{ opacity: inView ? 1 : 0.3 }} transition={{ duration: 0.6, delay: 2.2 }}>
          <p className="text-base leading-6">{NEED.get.label} <span className="text-off-white-light">— {NEED.get.note}</span></p>
          <List>{NEED.get.items.map((t) => <ListItem key={t}>{t}</ListItem>)}</List>
        </motion.div>
      </div>
    </div>
  );
}
/** Connector: dashed line with a square travelling along it (vertical on mobile, horizontal on desktop). */
function Flow({ on, delay }: { on: boolean; delay: number }) {
  const t = { duration: 1.4, delay, repeat: Infinity, repeatDelay: 1.6, ease };
  const o = on ? [0, 1, 1, 0] : 0;
  return (
    <div className="relative mx-auto h-12 w-px lg:h-px lg:w-16">
      <div className="absolute inset-0 border-l border-dashed border-dark-grey lg:border-l-0 lg:border-t" />
      <motion.span className="absolute -left-[3px] size-[7px] bg-off-white lg:hidden" initial={{ opacity: 0, top: -3 }} animate={on ? { opacity: o, top: [-3, -3, 45, 45] } : { opacity: 0 }} transition={t} />
      <motion.span className="absolute -top-[3px] hidden size-[7px] bg-off-white lg:block" initial={{ opacity: 0, left: -3 }} animate={on ? { opacity: o, left: [-3, -3, 61, 61] } : { opacity: 0 }} transition={t} />
    </div>
  );
}

/** N2 · Switch: one panel, two states that swap on their own (or on tap). */
export function NeedSwitch() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-20% 0px" });
  const [i, setI] = useState(0);
  const [k, setK] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => { setI((v) => 1 - v); setK((v) => v + 1); }, 5000);
    return () => clearTimeout(t);
  }, [i, k, inView]);
  const tabs = [NEED.need, NEED.get];
  const cur = tabs[i];
  return (
    <div ref={ref} className="grid w-full grid-cols-1 gap-16 lg:grid-cols-[420px_1fr]">
      <div className="flex flex-col gap-3">
        <Heading a={NEED.title} b={NEED.rest} />
        <p className="text-base leading-6 text-off-white-light">{NEED.sub}</p>
      </div>
      <div className="flex flex-col border border-dark-grey">
        <div className="grid grid-cols-2">
          {tabs.map((t, j) => (
            <button key={t.label} onClick={() => { setI(j); setK((v) => v + 1); }} className="flex cursor-pointer flex-col gap-4 px-6 pt-6 text-left md:px-10">
              <Mono className={cn("transition-colors duration-500", i === j ? "text-off-white" : "text-off-white-light")}>{t.label}</Mono>
              <div className="relative h-px w-full overflow-hidden bg-dark-grey">
                <motion.div key={`${k}-${j}`} className="absolute inset-0 origin-left bg-off-white" initial={{ scaleX: 0 }} animate={{ scaleX: i === j ? 1 : 0 }} transition={{ duration: i === j ? 5 : 0.3, ease: "linear" }} />
              </div>
            </button>
          ))}
        </div>
        <div className="relative min-h-[260px] p-6 md:p-10">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4, ease }} className="flex flex-col gap-6">
              <p className="text-xl leading-7 text-off-white-light">{cur.note}</p>
              <List>{cur.items.map((t) => <ListItem key={t}>{t}</ListItem>)}</List>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ PRICING ═══════════════ */

/** P1 · Timeline: both offers on one time axis — the scale of the work is visible at a glance. */
export function PricingTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  return (
    <div ref={ref} className="flex w-full flex-col gap-12">
      {/* axis: 24 hours → 8 weeks */}
      <div className="relative hidden h-[11px] md:block">
        <div className="absolute left-0 right-[calc(50%-40px)] top-[5px] h-px bg-dark-grey">
          <motion.div className="absolute inset-0 origin-left bg-off-white" initial={{ scaleX: 0 }} animate={{ scaleX: inView ? 1 : 0 }} transition={{ duration: 1.8, ease }} />
        </div>
        <span className="absolute left-0 top-0 size-[11px] bg-off-white" />
        <motion.span className="absolute left-[calc(50%+32px)] top-0 size-[11px] border border-off-white" initial={{ backgroundColor: "rgba(239,239,239,0)" }} animate={{ backgroundColor: inView ? "rgba(239,239,239,1)" : "rgba(239,239,239,0)" }} transition={{ delay: 1.7, duration: 0.3 }} />
      </div>
      <div className="grid grid-cols-1 gap-16 md:grid-cols-2">
        {PLANS.map((p, i) => (
          <motion.div key={p.title} className="flex flex-col gap-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 16 }} transition={{ duration: 0.6, delay: 0.2 + i * 1.3 }}>
            <div className="flex flex-col gap-2">
              <Mono className="text-off-white">{p.duration}</Mono>
              <p className="text-3xl text-off-white">{p.title}</p>
              <p className="max-w-sm text-base leading-6 text-off-white-light">{p.description}</p>
            </div>
            <div className="flex flex-col gap-1">
              <Mono className="text-off-white">From</Mono>
              <p className="text-xl leading-7 text-off-white">{p.price}</p>
            </div>
            <List>
              {p.features.map((f) => <ListItem key={f}>{f}</ListItem>)}
            </List>
          </motion.div>
        ))}
      </div>
      <p className="text-base leading-6 text-off-white-light">{PRICING_NOTE}</p>
    </div>
  );
}

/** P2 · Price list: full-width rows like an editorial price list; a row opens on hover / tap. */
export function PricingRows() {
  const [open, setOpen] = useState(0);
  return (
    <div className="flex w-full flex-col">
      {PLANS.map((p, i) => (
        <div key={p.title} className="flex flex-col border-t border-dark-grey last:border-b">
          <button onMouseEnter={() => setOpen(i)} onClick={() => setOpen(i)} className="grid cursor-pointer grid-cols-[1fr_auto] items-baseline gap-x-8 gap-y-2 py-8 text-left md:grid-cols-[200px_1fr_auto]">
            <Mono className="text-off-white-light md:order-none">{p.duration}</Mono>
            <p className="col-span-2 text-3xl text-off-white md:col-span-1">{p.title}</p>
            <p className="text-xl leading-7 text-off-white max-md:col-start-1 max-md:row-start-3">
              <span className="font-mono text-sm uppercase tracking-tight text-off-white-light">From </span>
              {p.price}
            </p>
          </button>
          <motion.div initial={false} animate={{ height: open === i ? "auto" : 0, opacity: open === i ? 1 : 0 }} transition={{ duration: 0.5, ease }} className="overflow-hidden">
            <div className="grid grid-cols-1 gap-8 pb-10 md:grid-cols-[200px_1fr_1fr]">
              <span className="hidden md:block" />
              <p className="max-w-sm text-base leading-6 text-off-white-light">{p.description}</p>
              <List>{p.features.map((f) => <ListItem key={f}>{f}</ListItem>)}</List>
            </div>
          </motion.div>
        </div>
      ))}
      <p className="pt-10 text-base leading-6 text-off-white-light">{PRICING_NOTE}</p>
    </div>
  );
}

/* ── page wrapper for one variant ── */
export function VariantBlock({ k, name, note, children }: { k: string; name: string; note: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <Separator />
        <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
          <Mono className="text-off-white">{k} · {name}</Mono>
          <p className="max-w-xl text-sm leading-5 text-off-white-light">{note}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
