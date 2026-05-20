import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/app/ui/status-badge";
import {
  formatTerminalSide,
  formatVerificationStatus,
  getPanelPositions,
  verificationTone,
} from "@/lib/breaker-queries";

function PositionMeta({ label, value }: { label: string; value: string | number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-[oklch(0.78_0.015_250)] bg-white px-2.5 py-1 text-xs font-semibold text-[oklch(0.32_0.018_250)]">
      <span className="text-[oklch(0.48_0.018_250)]">{label}</span>
      {value}
    </span>
  );
}

export default async function PanelDetailPage({
  params,
}: {
  params: Promise<{ panelCode: string }>;
}) {
  const { panelCode } = await params;
  const positions = await getPanelPositions(decodeURIComponent(panelCode));

  if (positions.length === 0) notFound();

  const panel = positions[0];
  const circuitCount = positions.filter((position) => position.circuit_id).length;
  const pointCount = positions.reduce((sum, position) => sum + position.served_point_count, 0);

  return (
    <main className="min-h-screen bg-[oklch(0.94_0.01_250)] text-[oklch(0.22_0.018_250)]">
      <header className="border-b border-[oklch(0.82_0.012_250)] bg-[oklch(0.985_0.004_250)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-6 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link className="text-sm font-semibold text-[oklch(0.36_0.08_245)]" href="/panels">
              Back to panels
            </Link>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-[oklch(0.48_0.018_250)]">
              Panel {panel.panel_code}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">
              {panel.panel_name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[oklch(0.42_0.018_250)]">
              {panel.location_notes ?? "No panel location notes yet."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone="info">{positions.length} positions</StatusBadge>
            <StatusBadge tone="info">{circuitCount} circuits</StatusBadge>
            <StatusBadge tone={pointCount > 0 ? "ok" : "warn"}>{pointCount} points</StatusBadge>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="grid gap-3">
          {positions.map((position) => (
            <article
              className="border border-[oklch(0.84_0.012_250)] bg-[oklch(0.99_0.003_250)] p-4"
              key={position.panel_position_id}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[oklch(0.48_0.018_250)]">
                    Position {position.position_label} / {formatTerminalSide(position.terminal_side)}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">
                    {position.circuit_label ?? "Open position"}
                  </h2>
                  <p className="mt-2 text-sm text-[oklch(0.46_0.018_250)]">
                    {position.breaker_device_label ?? "No breaker device assigned"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <PositionMeta label="Amps" value={position.amps ?? "Unknown"} />
                  <PositionMeta label="Voltage" value={`${position.nominal_voltage}V`} />
                  <PositionMeta label="Poles" value={position.poles ?? "Unknown"} />
                  <PositionMeta label="Points" value={position.served_point_count} />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[oklch(0.88_0.008_250)] pt-4">
                {position.circuit_id ? (
                  <>
                    <StatusBadge tone={verificationTone(position.circuit_verification_status)}>
                      {formatVerificationStatus(position.circuit_verification_status)}
                    </StatusBadge>
                    <Link
                      className="inline-flex h-10 items-center justify-center rounded-md border border-[oklch(0.72_0.018_250)] px-4 text-sm font-semibold text-[oklch(0.34_0.07_245)] transition hover:border-[oklch(0.52_0.09_245)]"
                      href={`/circuits/${position.circuit_id}`}
                    >
                      Open circuit
                    </Link>
                  </>
                ) : (
                  <StatusBadge tone="warn">Unassigned</StatusBadge>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
