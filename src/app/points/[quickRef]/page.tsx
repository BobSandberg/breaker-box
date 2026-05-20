import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/app/ui/status-badge";
import {
  formatElectricalPointKind,
  formatLoadCategory,
  formatVerificationStatus,
  formatWatts,
  getElectricalPointByQuickRef,
  getElectricalPointLoads,
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

export default async function PointDetailPage({
  params,
}: {
  params: Promise<{ quickRef: string }>;
}) {
  const { quickRef } = await params;
  const point = await getElectricalPointByQuickRef(decodeURIComponent(quickRef));

  if (!point) notFound();

  const loads = await getElectricalPointLoads(point.quick_ref);
  const panelPosition = point.panel_code
    ? `${point.panel_name} (${point.panel_code}), position ${point.position_label} ${point.terminal_side}`
    : "No panel position assigned";
  const breaker = point.breaker_amps
    ? `${point.breaker_amps}A, ${point.circuit_nominal_voltage ?? "unknown"}V`
    : "Unknown";
  const pointLocation = `${point.floor_name} / ${point.room_name}`;

  return (
    <main className="min-h-screen bg-[oklch(0.94_0.01_250)] text-[oklch(0.22_0.018_250)]">
      <header className="border-b border-[oklch(0.82_0.012_250)] bg-[oklch(0.985_0.004_250)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-6 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              className="text-sm font-semibold text-[oklch(0.36_0.08_245)]"
              href={`/rooms/${point.room_code}`}
            >
              Back to {point.room_name}
            </Link>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-[oklch(0.48_0.018_250)]">
              {formatElectricalPointKind(point.kind)} / {point.quick_ref}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">
              {point.label}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[oklch(0.42_0.018_250)]">
              {pointLocation}. {point.notes ?? "No point notes yet."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone={verificationTone(point.point_verification_status)}>
              Point {formatVerificationStatus(point.point_verification_status)}
            </StatusBadge>
            <StatusBadge tone={verificationTone(point.circuit_verification_status)}>
              Circuit {formatVerificationStatus(point.circuit_verification_status)}
            </StatusBadge>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-5 px-5 py-8 sm:px-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-5">
          <article className="border border-[oklch(0.84_0.012_250)] bg-[oklch(0.99_0.003_250)] p-5">
            <h2 className="text-xl font-semibold">Mapping</h2>
            <dl className="mt-3">
              <DetailItem label="Circuit" value={point.circuit_label ?? "Unassigned"} />
              <DetailItem label="Panel position" value={panelPosition} />
              <DetailItem label="Breaker" value={breaker} />
              <DetailItem
                label="Wire gauge"
                value={point.wire_gauge_awg ? `${point.wire_gauge_awg} AWG` : "Unknown"}
              />
            </dl>
            <div className="mt-4 flex flex-wrap gap-3">
              {point.circuit_id ? (
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-md border border-[oklch(0.72_0.018_250)] px-4 text-sm font-semibold text-[oklch(0.34_0.07_245)] transition hover:border-[oklch(0.52_0.09_245)]"
                  href={`/circuits/${point.circuit_id}`}
                >
                  Open circuit
                </Link>
              ) : null}
              {point.panel_code ? (
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-md border border-[oklch(0.72_0.018_250)] px-4 text-sm font-semibold text-[oklch(0.34_0.07_245)] transition hover:border-[oklch(0.52_0.09_245)]"
                  href={`/panels/${encodeURIComponent(point.panel_code)}`}
                >
                  Open panel
                </Link>
              ) : null}
            </div>
          </article>

          <article className="border border-[oklch(0.84_0.012_250)] bg-[oklch(0.99_0.003_250)] p-5">
            <h2 className="text-xl font-semibold">Attached loads</h2>
            <div className="mt-4 grid gap-3">
              {loads.length > 0 ? (
                loads.map((load) => (
                  <div
                    className="border border-[oklch(0.86_0.01_250)] p-4"
                    key={load.load_assignment_id}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[oklch(0.48_0.018_250)]">
                      {formatLoadCategory(load.category)}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold">
                      {load.label ?? load.load_type_name}
                    </h3>
                    <p className="mt-2 text-sm text-[oklch(0.46_0.018_250)]">
                      {load.quantity} x {load.load_type_name} /{" "}
                      {load.has_unknown_wattage
                        ? "unknown wattage"
                        : formatWatts(load.effective_watts)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-[oklch(0.46_0.018_250)]">
                  No loads are attached to this point yet.
                </p>
              )}
            </div>
          </article>
        </div>

        <aside className="border border-[oklch(0.84_0.012_250)] bg-[oklch(0.99_0.003_250)] p-5">
          <h2 className="text-xl font-semibold">Physical lookup</h2>
          <dl className="mt-3">
            <DetailItem label="Room" value={`${point.room_name} (${point.room_code})`} />
            <DetailItem label="Floor" value={`${point.floor_name} (${point.floor_code})`} />
            <DetailItem label="Wall/zone" value={point.wall_zone} />
            <DetailItem
              label="Ordinal"
              value={point.zone_ordinal ? String(point.zone_ordinal) : "Not specified"}
            />
          </dl>
        </aside>
      </section>
    </main>
  );
}
