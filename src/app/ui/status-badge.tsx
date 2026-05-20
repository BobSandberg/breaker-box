export type StatusTone = "ok" | "warn" | "bad" | "info";

export function StatusBadge({
  tone,
  children,
}: {
  tone: StatusTone;
  children: React.ReactNode;
}) {
  const styles: Record<StatusTone, string> = {
    ok: "border-[oklch(0.74_0.08_155)] bg-[oklch(0.96_0.025_155)] text-[oklch(0.34_0.08_155)]",
    warn: "border-[oklch(0.78_0.13_78)] bg-[oklch(0.96_0.035_78)] text-[oklch(0.38_0.09_78)]",
    bad: "border-[oklch(0.72_0.12_35)] bg-[oklch(0.96_0.03_35)] text-[oklch(0.36_0.1_35)]",
    info: "border-[oklch(0.72_0.08_245)] bg-[oklch(0.96_0.025_245)] text-[oklch(0.34_0.08_245)]",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${styles[tone]}`}
    >
      {children}
    </span>
  );
}
