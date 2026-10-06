import { cn } from "@/lib/utils";

export type Actor = "human" | "ai";

/**
 * One visual rule across the page: solid = a person, dashed = AI.
 * Used in the hero step labels and above the D/U/G/P steps.
 */
export function ActorMark({ actor, className }: { actor: Actor; className?: string }) {
  return (
    <svg viewBox="0 0 10 10" fill="none" className={cn("size-2.5 shrink-0", className)}>
      {actor === "human" ? (
        <circle cx="5" cy="5" r="4.25" fill="currentColor" />
      ) : (
        <circle cx="5" cy="5" r="4.25" stroke="currentColor" strokeWidth="1" strokeDasharray="1.6 1.6" />
      )}
    </svg>
  );
}

export function ActorTag({ actor, label, className }: { actor: Actor; label: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-mono text-xs uppercase leading-3 tracking-tight", className)}>
      <ActorMark actor={actor} />
      {label}
    </span>
  );
}
