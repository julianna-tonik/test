"use client";

import { Separator } from "@/components/ui/separator";
import { Reveal, SectionLabel } from "./shared";

/* Sections added for the tonik-first flow (variant D). Copy in [brackets] is a placeholder for the team. */

/** Two-tone heading + muted body: the same left column as "What changes", "Where it can go" and "What we need". */
function Intro({ lead, rest, text }: { lead: string; rest: string; text?: string }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-3xl leading-10 text-off-white">
        {lead} <span className="text-off-white-light">{rest}</span>
      </p>
      {text && <p className="text-base leading-6 text-off-white-light">{text}</p>}
    </div>
  );
}

const proof = [
  { value: "[00+]", label: "Marketing sites shipped" },
  { value: "[00+]", label: "Content migrations" },
  { value: "[00]", label: "Years building for startups and scale-ups" },
  { value: "[00]", label: "People across design, dev, and content" },
];

export function SanityWhyTonik() {
  return (
    <section className="flex w-full max-w-container-6xl flex-col gap-[120px] pb-[120px]">
      <SectionLabel>Why tonik</SectionLabel>
      <Reveal className="grid w-full grid-cols-1 gap-16 lg:grid-cols-[420px_1fr]">
        <Intro
          lead="[Our know-how makes the flow work.]"
          rest="[Sanity is the tool.]"
          text="[Short paragraph: what tonik brings — content modelling, design systems, migrations, AI workflows.]"
        />
        <div className="grid grid-cols-2 gap-x-8 gap-y-10">
          {proof.map((p) => (
            <div key={p.label} className="flex flex-col gap-3">
              <Separator />
              <p className="text-3xl leading-10 text-off-white">{p.value}</p>
              <p className="text-base leading-6 text-off-white-light">{p.label}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

const caseRows = [
  { label: "Challenge.", text: "[What wasn't working before]" },
  { label: "What we built.", text: "[System, sections, migration, AI workflow]" },
  { label: "Result.", text: "[One measurable outcome, e.g. time to launch a page]" },
];

export function SanityCaseStudy() {
  return (
    <section className="flex w-full max-w-container-6xl flex-col gap-[120px] pb-[120px]">
      <SectionLabel>Case study</SectionLabel>
      <Reveal className="grid w-full grid-cols-1 gap-16 lg:grid-cols-[420px_1fr]">
        <div className="flex flex-col gap-10">
          <Intro lead="[What we built for them, in one line.]" rest="[Client, industry.]" />
          <div className="flex flex-col gap-6">
            {caseRows.map((r) => (
              <div key={r.label} className="flex flex-col gap-3">
                <Separator />
                <p className="text-base leading-6">
                  {r.label} <span className="text-off-white-light">{r.text}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex aspect-[4/3] w-full items-center justify-center border border-dark-grey">
            <p className="font-mono text-sm uppercase leading-none tracking-tight text-off-white-light">[Project visual]</p>
          </div>
          <p className="text-xl leading-7 text-off-white">
            [“Short client quote.”] <span className="text-off-white-light">[Name, role]</span>
          </p>
        </div>
      </Reveal>
    </section>
  );
}

/* Monochrome tool marks (Simple Icons, CC0) plus one drawn mark for the client's own stack. */
const LOGOS: Record<string, React.ReactNode> = {
  Sanity: <path d="M7.394 7.31a5.745 5.745 0 0 1-.833-.68c-.913-.91-1.38-2.067-1.38-3.568v-.575C6.699.929 9.039 0 11.828 0c5.394 0 8.515 2.8 9.285 6.74H16.22c-.54-1.554-1.89-2.764-4.352-2.764-2.422 0-4.136 1.276-4.473 3.334h-.002ZM4.683 3.062c0 3.236 2.034 5.162 6.106 6.177l4.316.983c3.854.87 6.2 3.03 6.2 6.55a6.61 6.61 0 0 1-1.436 4.239c0-3.511-1.85-5.409-6.31-6.55l-4.236-.946c-3.393-.76-6.011-2.536-6.011-6.36a6.578 6.578 0 0 1 1.37-4.093ZM17.18 16.484c-.292 2.235-2.092 3.495-4.698 3.495-2.314 0-4.048-.946-4.703-2.99H2.694C3.518 21.44 7.224 24 12.519 24c2.828 0 5.277-.87 6.85-2.439v-.55c0-1.66-.433-2.876-1.342-3.816a5.508 5.508 0 0 0-.847-.71v-.001Z" fill="currentColor" />,
  "Next.js": <path d="M18.665 21.978C16.758 23.255 14.465 24 12 24 5.377 24 0 18.623 0 12S5.377 0 12 0s12 5.377 12 12c0 3.583-1.574 6.801-4.067 9.001L9.219 7.2H7.2v9.596h1.615V9.251l9.85 12.727Zm-3.332-8.533 1.6 2.061V7.2h-1.6v6.245Z" fill="currentColor" />,
  Vercel: <path d="M24 22.525H0l12-21.05 12 21.05z" fill="currentColor" />,
  PostHog: <path d="M9.854 14.5 5 9.647.854 5.5A.5.5 0 0 0 0 5.854V8.44a.5.5 0 0 0 .146.353L5 13.647l.147.146L9.854 18.5l.146.147v-.049c.065.03.134.049.207.049h2.586a.5.5 0 0 0 .353-.854L9.854 14.5zm0-5-4-4a.487.487 0 0 0-.409-.144.515.515 0 0 0-.356.21.493.493 0 0 0-.089.288V8.44a.5.5 0 0 0 .147.353l9 9a.5.5 0 0 0 .853-.354v-2.585a.5.5 0 0 0-.146-.354l-5-5zm1-4a.5.5 0 0 0-.854.354V8.44a.5.5 0 0 0 .147.353l4 4a.5.5 0 0 0 .853-.354V9.854a.5.5 0 0 0-.146-.354l-4-4zm12.647 11.515a3.863 3.863 0 0 1-2.232-1.1l-4.708-4.707a.5.5 0 0 0-.854.354v6.585a.5.5 0 0 0 .5.5H23.5a.5.5 0 0 0 .5-.5v-.6c0-.276-.225-.497-.499-.532zm-5.394.032a.8.8 0 1 1 0-1.6.8.8 0 0 1 0 1.6zM.854 15.5a.5.5 0 0 0-.854.354v2.293a.5.5 0 0 0 .5.5h2.293c.222 0 .39-.135.462-.309a.493.493 0 0 0-.109-.545L.854 15.501zM5 14.647.854 10.5a.5.5 0 0 0-.854.353v2.586a.5.5 0 0 0 .146.353L4.854 18.5l.146.147h2.793a.5.5 0 0 0 .353-.854L5 14.647z" fill="currentColor" />,
  "Claude · MCP": <path d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z" fill="currentColor" />,
  "Your stack": (
    <g stroke="currentColor" strokeWidth="1.3" fill="none">
      <rect x="1.5" y="9.2" width="6.4" height="6.4" />
      <rect x="16.1" y="2.4" width="6.4" height="6.4" />
      <rect x="16.1" y="16.1" width="6.4" height="6.4" />
      <path d="M7.9 12.4H12M12 5.6v13.7M12 5.6h4.1M12 19.3h4.1" />
    </g>
  ),
};

const tools = [
  { name: "Sanity", text: "Structured content your team edits without breaking the layout." },
  { name: "Next.js", text: "Fast pages built from your approved sections." },
  { name: "Vercel", text: "A preview link for every draft, and safe, instant publishing." },
  { name: "PostHog", text: "Analytics and A/B tests on every page." },
  { name: "Claude · MCP", text: "Drafts pages from a plain-language request." },
  { name: "Your stack", text: "Your CRM, translation, and internal tools, connected." },
];

export function SanityToolkit() {
  return (
    <section className="flex w-full max-w-container-6xl flex-col gap-[120px] pb-[120px]">
      <SectionLabel>Our toolkit</SectionLabel>
      <Reveal className="grid w-full grid-cols-1 gap-10 lg:grid-cols-[420px_1fr]">
        <Intro
          lead="Proven tools,"
          rest="chosen for the job."
          text="We build on tools we know inside out, so your site stays fast, safe to edit, and easy to grow. Sanity is one of them."
        />
        {/* same tile as "Where it can go": phones put the mark left of the text */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {tools.map((t) => (
            <div key={t.name} className="flex flex-row items-start gap-6 md:flex-col">
              <div className="flex size-20 shrink-0 items-center justify-center md:aspect-[4/3] md:size-auto md:w-full md:border md:border-dark-grey">
                <svg aria-hidden viewBox="0 0 24 24" className="size-8 text-off-white">
                  {LOGOS[t.name]}
                </svg>
              </div>
              <p className="text-base leading-6">
                {t.name}. <span className="text-off-white-light">{t.text}</span>
              </p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
