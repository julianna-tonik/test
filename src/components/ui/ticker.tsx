import Image from "next/image";

import a16zspeedrun from "@/assets/logos/a16zspeedrun.svg";
import clay from "@/assets/logos/clay.svg";
import extropic from "@/assets/logos/extropic.svg";
import langchain from "@/assets/logos/langchain.svg";
import llamaindex from "@/assets/logos/llamaindex.svg";
import maintainx from "@/assets/logos/maintainx.svg";
import meritech from "@/assets/logos/meritech.svg";
import n8n from "@/assets/logos/n8n.svg";
import okta from "@/assets/logos/okta.svg";
import retool from "@/assets/logos/retool.svg";
import speakeasy from "@/assets/logos/speakeasy.svg";
import supabase from "@/assets/logos/supabase.svg";

const logos = [
  { name: "n8n", src: n8n, width: 79, height: 24 },
  { name: "LlamaIndex", src: llamaindex, width: 108, height: 24 },
  { name: "a16z Speedrun", src: a16zspeedrun, width: 173, height: 24 },
  { name: "Extropic", src: extropic, width: 133, height: 24 },
  { name: "LangChain", src: langchain, width: 114, height: 25 },
  { name: "Supabase", src: supabase, width: 123, height: 24 },
  { name: "Okta", src: okta, width: 61, height: 24 },
  { name: "Clay", src: clay, width: 43, height: 24 },
  { name: "Retool", src: retool, width: 69, height: 24 },
  { name: "Speakeasy", src: speakeasy, width: 115, height: 24 },
  { name: "MaintainX", src: maintainx, width: 95, height: 24 },
  { name: "Meritech", src: meritech, width: 80, height: 24 },
];

interface TickerProps {
  duration?: number;
  gap?: number;
}

export function Ticker({ duration = 30, gap = 16 }: TickerProps) {
  const gapPx = gap * 4;
  const logosWidth = logos.reduce(
    (total, logo, i) =>
      total +
      logo.width * (20 / logo.height) +
      2 * 4 * 6 +
      (i === 0 ? 0 : gapPx),
    0,
  );

  return (
    <div className="relative flex w-full overflow-hidden z-10">
      {/* Gradient overlays */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-off-black to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-off-black to-transparent" />

      {/* Ticker content - CSS animation for GPU acceleration */}
      <div
        className="flex animate-ticker"
        style={
          {
            gap: `${gapPx}px`,
            "--ticker-duration": `${duration}s`,
            "--ticker-half-point": `${logosWidth + gapPx}px`,
            width: `${logosWidth * 2 + gapPx}px`
          } as React.CSSProperties
        }
      >
        {/* First set of logos */}
        <div
          className="flex"
          style={{ gap: `${gapPx}px`, width: `${logosWidth}px` }}
        >
          {logos.map((logo, index) => (
            <div
              key={`first-${index}`}
              className="flex shrink-0 h-8 items-center justify-center rounded-sm px-6"
            >
              <Image
                src={logo.src}
                alt={logo.name}
                height={20}
                width={Math.round(logo.width * (20 / logo.height))}
                className="opacity-80 h-5 w-auto"
              />
            </div>
          ))}
        </div>

        {/* Duplicate set for seamless loop */}
        <div
          className="flex shrink-0 w-min"
          style={{ gap: `${gapPx}px`, width: `${logosWidth}px` }}
        >
          {logos.map((logo, index) => (
            <div
              key={`second-${index}`}
              className="flex shrink-0 h-8 items-center justify-center rounded-sm px-6"
            >
              <Image
                src={logo.src}
                alt={logo.name}
                height={20}
                width={Math.round(logo.width * (20 / logo.height))}
                className="opacity-80 h-5 w-auto"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
