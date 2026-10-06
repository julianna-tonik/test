"use client";

import { PANELS, PHASE_S, PanelCtx } from "@/components/sanity/product-fragments";
import { MigrationLanes, RequestScene } from "@/components/sanity/request-scenes";
import { icons } from "@/components/sanity/what-changes";

/** Static end-state of every illustration, for exporting to Figma. Not linked from the site. */
export default function SnapshotPage() {
  return (
    <div className="flex min-h-screen flex-col gap-10 bg-off-black p-10">
      <div className="grid grid-cols-3 gap-6">
        {PANELS.map((Panel, i) => (
          <PanelCtx.Provider key={i} value={{ mode: "after", dur: PHASE_S[i as 0 | 1 | 2] }}>
            <svg data-snap={`hero-${i + 1}`} viewBox="0 0 320 240" fill="none" className="w-full border border-[#4a4a4a] bg-[#1c1c1c]">
              <Panel />
            </svg>
          </PanelCtx.Provider>
        ))}
      </div>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} data-snap-wrap={`example-${i + 1}`} className="w-[960px]">
          <RequestScene index={i} active={false} snapshot />
        </div>
      ))}
      <div data-snap-wrap="migration" className="w-[960px]">
        <MigrationLanes snapshot />
      </div>
      <div className="flex gap-6">
        {icons.map((ic, i) => (
          <svg key={i} data-snap={`icon-${i + 1}`} viewBox="0 0 84 84" fill="none" className="size-[84px]">
            {ic(false)}
          </svg>
        ))}
      </div>
    </div>
  );
}
