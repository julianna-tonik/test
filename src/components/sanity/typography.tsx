"use client";

import { useEffect, useRef } from "react";

/**
 * Typography guard for the page: glues short words (a, the, to, and, or…) to the next word
 * with a no-break space so they never hang at the end of a line. Runs on the rendered text
 * (and on text that appears later, e.g. switching captions); SVG illustrations are left alone.
 */
const SHORT = /(^|[\s(“"])(a|an|the|to|of|in|on|or|and|for|with|by|at|as|is|it|we|no|our|your|via|from|&|—|–)\s(?=\S)/gi;
const glue = (s: string) => s.replace(SHORT, (_, pre, w) => `${pre}${w} `);

function fix(root: Node) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.parentElement?.closest("svg, script, style, textarea, input") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const v = n.nodeValue ?? "";
    const g = glue(v);
    if (g !== v) n.nodeValue = g;
  }
}

export function NoOrphans({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    fix(el);
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === "characterData") fix(r.target);
        r.addedNodes.forEach((n) => fix(n));
      }
    });
    mo.observe(el, { subtree: true, childList: true, characterData: true });
    return () => mo.disconnect();
  }, []);
  return <div ref={ref} className={className}>{children}</div>;
}
