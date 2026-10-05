"use client";

import { Reveal, SectionLabel } from "./shared";

const D = "#383838";
const G = "#666666";
const Sq = ({ x, y, s, c = D }: { x: number; y: number; s: number; c?: string }) => (
  <rect x={x + 0.5} y={y + 0.5} width={s} height={s} stroke={c} />
);

/** 84px line icons in the Vibe Fixer "Why tonik" language. The `.mv` group drifts on hover. */
const icons: [React.ReactNode, React.ReactNode][] = [
  [<Sq key="a" x={18} y={18} s={47} />, <><path d="M15 36H31M12 31H31M20 41H31M22 46H31" stroke={G} /><circle cx="54" cy="38" r="19.5" stroke={G} /></>],
  [<Sq key="a" x={10} y={22} s={40} />, <><Sq x={54} y={14} s={16} c={G} /><Sq x={54} y={34} s={16} c={G} /><Sq x={54} y={54} s={16} c={G} /></>],
  [<><Sq x={12} y={30} s={28} /><Sq x={44} y={30} s={28} /></>, <circle cx="42" cy="30" r="16.5" stroke={G} />],
  [<><Sq x={18} y={18} s={24} /><Sq x={42} y={18} s={24} /><Sq x={18} y={42} s={24} /><Sq x={42} y={42} s={24} /></>, <path d="M42 12L72 42L42 72L12 42Z" stroke={G} />],
  [<><Sq x={6} y={30} s={24} /><Sq x={30} y={30} s={24} /><Sq x={54} y={30} s={24} /></>, <><circle cx="18" cy="42" r="8.5" stroke={G} /><circle cx="42" cy="42" r="8.5" stroke={G} /><circle cx="66" cy="42" r="8.5" stroke={G} /></>],
  [<Sq key="a" x={18} y={18} s={48} />, <><circle cx="42" cy="42" r="17.5" stroke={G} /><path d="M34 42.5L40 48.5L51 36.5" stroke={G} /></>],
];

const items = [
  ["Launch campaigns faster", "Turn a brief into a Sanity draft without starting from scratch."],
  ["Adapt campaigns for each audience", "Create versions for markets, segments, and languages."],
  ["Test more ideas", "Create, preview, and measure page variations faster."],
  ["Keep every page on-brand", "Use layouts and content patterns your team has approved."],
  ["Reuse your strongest content", "Reuse customer stories, product messages, and CTAs."],
  ["Review and publish with confidence", "Keep staging, approvals, and publishing under control."],
];

export function SanityWhatChanges() {
  return (
    <section className="flex w-full max-w-container-6xl flex-col gap-[120px] pb-[120px]">
      <SectionLabel>What changes for your team</SectionLabel>
      <div className="grid w-full grid-cols-1 gap-16 lg:grid-cols-[340px_1fr]">
        <Reveal>
          <p className="text-3xl leading-10 text-off-white">
            Marketing moves faster. <span className="text-off-white-light">The website stays consistent.</span>
          </p>
        </Reveal>
        <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 md:grid-cols-3">
          {items.map(([title, text], i) => (
            <Reveal key={title} delay={(i % 3) * 0.08} className="group flex flex-col gap-6">
              <svg viewBox="0 0 84 84" fill="none" className="m-[-18px] size-[84px]">
                {icons[i][0]}
                <g className="transition-transform duration-700 ease-out group-hover:translate-x-[3px] group-hover:-translate-y-[3px]">{icons[i][1]}</g>
              </svg>
              <div className="flex w-full flex-col text-base leading-6">
                <p className="text-off-white">{title}</p>
                <p className="text-off-white-light">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
