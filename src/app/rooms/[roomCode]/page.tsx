import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatElectricalPointKind,
  formatVerificationStatus,
  getElectricalPointsForRoom,
  getRoomSummary,
  verificationTone,
} from "@/lib/breaker-queries";

function StatusBadge({
  tone,
  children,
}: {
  tone: "ok" | "warn" | "bad" | "info";
  children: React.ReactNode;
}) {
  const styles = {
    ok: "border-[oklch(0.74_0.08_155)] bg-[oklch(0.96_0.025_155)] text-[oklch(0.34_0.08_155)]",
    warn: "border-[oklch(0.78_0.13_78)] bg-[oklch(0.96_0.035_78)] text-[oklch(0.38_0.09_78)]",
    bad: "border-[oklch(0.72_0.12_35)] bg-[oklch(0.96_0.03_35)] text-[oklch(0.36_0.1_35)]",
    info: "border-[oklch(0.72_0.08_245)] bg-[oklch(0.96_0.025_245)] text-[oklch(0.34_0.08_245)]",
  };

  return (
    <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${styles[tone]}`}>
      {children}
    </span>
  );
}

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ roomCode: string }>;
}) {
  const { roomCode } = await params;
  const room = await getRoomSummary(roomCode);

  if (!room) notFound();

  const points = await getElectricalPointsForRoom(room.room_code);

  return (
    <main className="min-h-screen bg-[oklch(0.94_0.01_250)] text-[oklch(0.22_0.018_250)]">
      <header className="border-b border-[oklch(0.82_0.012_250)] bg-[oklch(0.985_0.004_250)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-6 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link className="text-sm font-semibold text-[oklch(0.36_0.08_245)]" href="/rooms">
              Back to rooms
            </Link>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-[oklch(0.48_0.018_250)]">
              {room.floor_code} / {room.floor_name}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">
              {room.room_name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[oklch(0.42_0.018_250)]">
              Room code {room.room_code}. {room.notes ?? "No room notes yet."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone="info">{room.point_count} points</StatusBadge>
            <StatusBadge tone={room.unresolved_count > 0 ? "warn" : "ok"}>
              {room.unresolved_count} unresolved
            </StatusBadge>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="grid gap-3">
          {points.map((point) => {
            const panelPosition = point.panel_code
              ? `${point.panel_code} ${point.position_label} ${point.terminal_side}`
              : "No panel position";

            return (
              <article
                className="border border-[oklch(0.84_0.012_250)] bg-[oklch(0.99_0.003_250)] p-4"
                key={point.electrical_point_id}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[oklch(0.48_0.018_250)]">
                      {point.quick_ref} / {formatElectricalPointKind(point.kind)}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold">{point.label}</h2>
                    <p className="mt-2 text-sm text-[oklch(0.46_0.018_250)]">
                      {point.wall_zone} zone
                      {point.zone_ordinal ? `, position ${point.zone_ordinal}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <StatusBadge tone={verificationTone(point.point_verification_status)}>
                      Point {formatVerificationStatus(point.point_verification_status)}
                    </StatusBadge>
                    <StatusBadge tone={verificationTone(point.circuit_verification_status)}>
                      Circuit {formatVerificationStatus(point.circuit_verification_status)}
                    </StatusBadge>
                  </div>
                </div>

                <dl className="mt-5 grid gap-3 border-t border-[oklch(0.88_0.008_250)] pt-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <dt className="font-medium text-[oklch(0.48_0.018_250)]">Circuit</dt>
                    <dd className="mt-1 font-semibold">{point.circuit_label ?? "Unassigned"}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-[oklch(0.48_0.018_250)]">Panel position</dt>
                    <dd className="mt-1 font-semibold">{panelPosition}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-[oklch(0.48_0.018_250)]">Breaker</dt>
                    <dd className="mt-1 font-semibold">
                      {point.breaker_amps ? `${point.breaker_amps}A` : "Unknown"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-[oklch(0.48_0.018_250)]">Wire gauge</dt>
                    <dd className="mt-1 font-semibold">
                      {point.wire_gauge_awg ? `${point.wire_gauge_awg} AWG` : "Unknown"}
                    </dd>
                  </div>
                </dl>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
