import React from "react";

export function LegalSection({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="flex items-center gap-3 bg-primary px-5 py-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-accent/50 bg-accent/20 text-xs font-bold text-accent">
          {num}
        </span>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-primary-foreground">{title}</h2>
      </div>
      <div className="p-5 space-y-3 text-sm leading-relaxed text-foreground">{children}</div>
    </div>
  );
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1 my-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm text-foreground">
          <span className="text-accent font-bold shrink-0">—</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function HighlightBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 text-sm text-muted-foreground my-3">
      {children}
    </div>
  );
}

export function WarningBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-yellow-400/50 bg-yellow-50 dark:bg-yellow-900/10 p-4 text-sm text-yellow-800 dark:text-yellow-200 my-3">
      {children}
    </div>
  );
}

export function ContactBlock() {
  return (
    <div className="flex flex-wrap gap-3 rounded-lg bg-primary p-4 mt-3 text-sm text-primary-foreground/75">
      <span>📧 contacto@porcentajelaboral.com</span>
      <span className="text-primary-foreground/30">|</span>
      <span>📍 Santiago, Chile</span>
    </div>
  );
}
