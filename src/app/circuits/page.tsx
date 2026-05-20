import Link from "next/link";
import { StatusBadge } from "@/app/ui/status-badge";
import {
  formatTerminalSide,
  formatVerificationStatus,
  getCircuitSummaries,
  verificationTone,
} from "@/lib/breaker-queries";

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-[oklch(0.78_0.015_250)] bg-white px-2.5 py-1 text-xs font-semibold text-[oklch(0.32_0.018_250)]">
      <span className="text-[oklch(0.48_0.018_250)]">{label}</span>
      {value}
    </span>
  );
}

export default async function CircuitsPage() {
  const circuits = await getCircuitSummaries();
  const mappedPoints = circuits.reduce((sum, circuit) => sum + circuit.point_count, 0);
  const unresolved = circuits.reduce(
    (sum, circuit) => sum + circuit.unresolved_point_count,
    0,
  );

  return (
    <main className="min-h-screen bg-[oklch(0.94_0.01_250)] text-[oklch(0.22_0.018_250)]">
      <header className="border-b border-[oklch(0.82_0.012_250)] bg-[oklch(0.985_0.004_250)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-6 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link className="text-sm font-semibold text-[oklch(0.36_0.08_245)]" href="/">
              Back home
            </Link>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-[oklch(0.42_0.05_245)]">
              Breaker Box
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">
              Circuits
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[oklch(0.42_0.018_250)]">
              Read-only circuit lookup from the local Supabase seed data.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatPill label="Circuits" value={circuits.length} />
            <StatPill label="Points" value={mappedPoints} />
            <StatPill label="Unresolved" value={unresolved} />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="grid gap-3">
          {circuits.map((circuit) => {
            const position = circuit.panel_code
              ? `${circuit.panel_code} ${circuit.position_label} ${formatTerminalSide(
                  circuit.terminal_side,
                )}`
              : "No panel position";

            return (
              <Link
                className="block border border-[oklch(0.84_0.012_250)] bg-[oklch(0.99_0.003_250)] p-4 transition hover:border-[oklch(0.62_0.08_245)]"
                href={`/circuits/${circuit.circuit_id}`}
                key={circuit.circuit_id}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[oklch(0.48_0.018_250)]">
                      {position}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold">{circuit.circuit_label}</h2>
                    <p className="mt-2 text-sm text-[oklch(0.46_0.018_250)]">
                      {circuit.breaker_amps ? `${circuit.breaker_amps}A` : "Unknown amps"} /{" "}
                      {circuit.nominal_voltage}V
                      {circuit.wire_gauge_awg ? ` / ${circuit.wire_gauge_awg} AWG` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <StatusBadge tone={verificationTone(circuit.verification_status)}>
                      {formatVerificationStatus(circuit.verification_status)}
                    </StatusBadge>
                    <StatusBadge tone={circuit.unresolved_point_count > 0 ? "warn" : "ok"}>
                      {circuit.point_count} points
                    </StatusBadge>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
