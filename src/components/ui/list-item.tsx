import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function List({
  children,
  className,
  ...rest
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-col gap-3", className)} {...rest}>
      {children}
    </ul>
  );
}

export function ListItem({
  children,
  className,
  ...rest
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("flex w-full items-start gap-4 relative group", className)}
      {...rest}
    >
      <div className="absolute left-3 top-px h-[calc(100%+var(--spacing)*3)] w-0 group-last:hidden">
        <svg className="h-full w-px" preserveAspectRatio="none">
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="100%"
            strokeWidth="1"
            className="stroke-off-white-light"
          />
        </svg>
      </div>
      <div className="z-10 flex size-6 shrink-0 items-center justify-center border border-off-white-light bg-off-black">
        <svg width="14" height="14" viewBox="0 0 14 14">
          <path
            d="M2.8 7L5.6 9.8L11.2 4.2"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-off-white-light"
          />
        </svg>
      </div>
      <p className="text-base leading-6 text-off-white">{children}</p>
    </div>
  );
}
