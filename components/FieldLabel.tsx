import type { ReactNode } from "react";

interface FieldLabelProps {
  children: ReactNode;
}

export default function FieldLabel({ children }: FieldLabelProps) {
  return (
    <span className="w-12 shrink-0 rounded-lg border border-[var(--border)] px-2 py-1 text-center text-xs font-medium text-[var(--text-sub)] sm:text-sm">
      {children}
    </span>
  );
}
