import { Globe } from "lucide-react";

export interface SourceInfo {
  key: string;
  label: string;
  bg: string;
  text: string;
  shortLabel: string;
}

export const JOB_SOURCES: Record<string, SourceInfo> = {
  linkedin:     { key: "linkedin",     label: "LinkedIn",        bg: "#0077B5", text: "#FFFFFF", shortLabel: "in" },
  indeed:       { key: "indeed",       label: "Indeed",          bg: "#003A9B", text: "#FFFFFF", shortLabel: "iD" },
  trabajando:   { key: "trabajando",   label: "Trabajando.com",  bg: "#2E8B57", text: "#FFFFFF", shortLabel: "Tr" },
  computrabajo: { key: "computrabajo", label: "CompuTrabajo",    bg: "#F57C00", text: "#FFFFFF", shortLabel: "CT" },
  getonbrd:     { key: "getonbrd",     label: "Get on Board",    bg: "#2D2D2D", text: "#00E676", shortLabel: "Go" },
  laborum:      { key: "laborum",      label: "Laborum",         bg: "#E31937", text: "#FFFFFF", shortLabel: "La" },
  chiletrabajos:{ key: "chiletrabajos",label: "ChileTrabajos",   bg: "#003DA5", text: "#FFFFFF", shortLabel: "Ch" },
  bne:          { key: "bne",          label: "BNE",             bg: "#003DA5", text: "#FFFFFF", shortLabel: "BN" },
  otro:         { key: "otro",         label: "Portal de empleo",bg: "#9CA3AF", text: "#FFFFFF", shortLabel: "🔗" },
};

export function detectSourceFromUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname.includes("linkedin")) return "linkedin";
    if (hostname.includes("indeed")) return "indeed";
    if (hostname.includes("trabajando")) return "trabajando";
    if (hostname.includes("computrabajo")) return "computrabajo";
    if (hostname.includes("getonbrd") || hostname.includes("getonboard")) return "getonbrd";
    if (hostname.includes("laborum")) return "laborum";
    if (hostname.includes("chiletrabajos")) return "chiletrabajos";
    if (hostname.includes("bne") || hostname.includes("bolsanacionalempleo")) return "bne";
  } catch {}
  return "otro";
}

export function isValidUrl(str: string): boolean {
  try {
    const u = new URL(str);
    return ["http:", "https:"].includes(u.protocol);
  } catch {
    return false;
  }
}

/**
 * Renders a branded badge/icon for a job source.
 * size: "sm" (24px), "md" (36px), "lg" (48px)
 */
export function SourceBadge({
  sourceKey,
  size = "md",
}: {
  sourceKey: string;
  size?: "sm" | "md" | "lg";
}) {
  const info = JOB_SOURCES[sourceKey] || JOB_SOURCES.otro;
  const dims = size === "sm" ? "h-6 w-6 text-[9px]" : size === "md" ? "h-9 w-9 text-xs" : "h-12 w-12 text-sm";

  if (info.key === "otro") {
    return (
      <div className={`flex items-center justify-center rounded-lg bg-muted text-muted-foreground ${dims}`}>
        <Globe className={size === "sm" ? "h-3.5 w-3.5" : size === "md" ? "h-4 w-4" : "h-5 w-5"} />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-lg font-bold shrink-0 ${dims}`}
      style={{ backgroundColor: info.bg, color: info.text }}
    >
      {info.shortLabel}
    </div>
  );
}

/**
 * Renders a full source label with icon and name.
 */
export function SourceLabel({ sourceKey }: { sourceKey: string }) {
  const info = JOB_SOURCES[sourceKey] || JOB_SOURCES.otro;
  return (
    <div className="flex items-center gap-2">
      <SourceBadge sourceKey={sourceKey} size="sm" />
      <span className="text-sm font-medium" style={{ color: info.bg }}>
        {info.label}
      </span>
    </div>
  );
}
