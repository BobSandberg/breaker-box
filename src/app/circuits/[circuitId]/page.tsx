import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/app/ui/status-badge";
import {
  formatElectricalPointKind,
  formatTerminalSide,
  formatVerificationStatus,
  getCircuitSummary,
  getElectricalPointsForCircuit,
  verificationTone,
} from "@/lib/breaker-queries";

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-[oklch(0.88_0.008_250)] py-4 first:border-t-0">
      <dt className="text-sm font-medium text-[oklch(0.48_0.018_250)]">{label}</dt>
      <dd className="mt-1 font-semibold text-[oklch(0.24_0.018_250)]">{value}</dd>
    </div>
  );
}

export default async function CircuitDetailPage({
  params,
}: {
  params: Promise<{ circuitId: string }>;
}) {
  const { circuitId } = await params;
  const circuit = await getCircuitSummary(circuitId);

  if (!circuit) notFound();

  const points = await getElectricalPointsForCircuit(circuit.circuit_id);
  const panelPosition = circuit.panel_code
    ? `${circuit.panel_name} (${circuit.panel_code}), position ${circuit.position_label} ${formatTerminalSide(
        circuit.terminal_side,
      )}`
    : "No panel position assigned";

  return (
    <main className="min-h-screen bg-[oklch(0.94_0.01_250)] text-[oklch(0.22_0.018_250)]">
      <header className="border-b border-[oklch(0.82_0.012_250)] bg-[oklch(0.985_0.004_250)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-6 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link className="text-sm font-semibold text-[oklch(0.36_0.08_245)]" href="/circuits">
              Back to circuits
            </Link>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-[oklch(0.48_0.018_250)]">
              Circuit
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">
              {circuit.circuit_label}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[oklch(0.42_0.018_250)]">
              {circuit.notes ?? "No circuit notes yet."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone={verificationTone(circuit.verification_status)}>
              {formatVerificationStatus(circuit.verification_status)}
            </StatusBadge>
            <StatusBadge tone={circuit.unresolved_point_count > 0 ? "warn" : "ok"}>
              {circuit.point_count} points
            </StatusBadge>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-5 px-5 py-8 sm:px-8 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="border border-[oklch(0.84_0.012_250)] bg-[oklch(0.99_0.003_250)] p-5">
          <h2 className="text-xl font-semibold">Breaker mapping</h2>
          <dl className="mt-3">
            <DetailItem label="Panel position" value={panelPosition} />
            <DetailItem
              label="Breaker"
              value={
                circuit.breaker_amps
                  ? `${circuit.breaker_amps}A / ${circuit.nominal_voltage}V`
                  : `Unknown amps / ${circuit.nominal_voltage}V`
              }
            />
            <DetailItem
              label="Wire gauge"
              value={circuit.wire_gauge_awg ? `${circuit.wire_gauge_awg} AWG` : "Unknown"}
            />
            <DetailItem label="GFCI" value={circuit.gfci_status ?? "Unknown"} />
            <DetailItem label="AFCI" value={circuit.afci_status ?? "Unknown"} />
          </dl>
          {circuit.panel_code ? (
            <Link
              className="mt-4 inline-flex h-10 items-center justify-center rounded-md border border-[oklch(0.72_0.018_250)] px-4 text-sm font-semibold text-[oklch(0.34_0.07_245)] transition hover:border-[oklch(0.52_0.09_245)]"
              href={`/panels/${encodeURIComponent(circuit.panel_code)}`}
            >
              Open panel
            </Link>
          ) : null}
        </aside>

        <article className="border border-[oklch(0.84_0.012_250)] bg-[oklch(0.99_0.003_250)] p-5">
          <h2 className="text-xl font-semibold">Served points</h2>
          <div className="mt-4 grid gap-3">
            {points.length > 0 ? (
              points.map((point) => (
                <Link
                  className="border border-[oklch(0.86_0.01_250)] p-4 transition hover:border-[oklch(0.62_0.08_245)]"
                  href={`/points/${encodeURIComponent(point.quick_ref)}`}
                  key={point.electrical_point_id}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[oklch(0.48_0.018_250)]">
                    {point.quick_ref} / {formatElectricalPointKind(point.kind)}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold">{point.label}</h3>
                  <p className="mt-2 text-sm text-[oklch(0.46_0.018_250)]">
                    {point.floor_name} / {point.room_name} / {point.wall_zone}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-sm leading-6 text-[oklch(0.46_0.018_250)]">
                No served electrical points are assigned to this circuit yet.
              </p>
            )}
          </div>
        </article>
      </section>
    </main>
  );
}
