import Link from "next/link";
import { getPanelPositions } from "@/lib/breaker-queries";

type PanelGroup = {
  panel_code: string;
  panel_name: string;
  location_notes: string | null;
  positionCount: number;
  circuitCount: number;
  servedPointCount: number;
};

export default async function PanelsPage() {
  const positions = await getPanelPositions();
  const panels = Array.from(
    positions
      .reduce((groups, position) => {
        const group =
          groups.get(position.panel_code) ??
          ({
            panel_code: position.panel_code,
            panel_name: position.panel_name,
            location_notes: position.location_notes,
            positionCount: 0,
            circuitCount: 0,
            servedPointCount: 0,
          } satisfies PanelGroup);

        group.positionCount += 1;
        group.servedPointCount += position.served_point_count;
        if (position.circuit_id) group.circuitCount += 1;
        groups.set(position.panel_code, group);
        return groups;
      }, new Map<string, PanelGroup>())
      .values(),
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
              Panels
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[oklch(0.42_0.018_250)]">
              Panel-first view of breaker positions, assigned circuits, and mapped points.
            </p>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="grid gap-3">
          {panels.map((panel) => (
            <Link
              className="grid gap-3 border border-[oklch(0.84_0.012_250)] bg-[oklch(0.99_0.003_250)] p-4 transition hover:border-[oklch(0.62_0.08_245)] sm:grid-cols-[1fr_auto] sm:items-center"
              href={`/panels/${encodeURIComponent(panel.panel_code)}`}
              key={panel.panel_code}
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[oklch(0.48_0.018_250)]">
                  Panel {panel.panel_code}
                </p>
                <h2 className="mt-1 text-xl font-semibold">{panel.panel_name}</h2>
                <p className="mt-1 text-sm text-[oklch(0.46_0.018_250)]">
                  {panel.location_notes ?? "No location notes yet."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 sm:justify-end">
                <span className="inline-flex items-center gap-1 rounded-md border border-[oklch(0.78_0.015_250)] bg-white px-2.5 py-1 text-xs font-semibold">
                  {panel.positionCount} positions
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-[oklch(0.78_0.015_250)] bg-white px-2.5 py-1 text-xs font-semibold">
                  {panel.circuitCount} circuits
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-[oklch(0.78_0.015_250)] bg-white px-2.5 py-1 text-xs font-semibold">
                  {panel.servedPointCount} points
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
