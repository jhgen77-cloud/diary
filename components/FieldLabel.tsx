import type { ReactNode } from "react";

interface FieldLabelProps {
  children: ReactNode;
}

export default function FieldLabel({ children }: FieldLabelProps) {
  return (
    <span className="w-12 shrink-0 rounded-lg border border-black/10 px-2 py-1 text-center text-xs font-medium text-black/70 sm:text-sm dark:border-white/15 dark:text-zinc-300">
      {children}
    </span>
  );
}
