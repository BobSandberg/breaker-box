import Link from "next/link";

const plannedFeatures = [
  "Room-first circuit lookup",
  "Panel position and circuit mapping",
  "Load catalog and what-if summaries",
  "Verification history with safety status",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-16">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-cyan-300">
          Breaker Box
        </p>
        <div className="max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            Electrical circuit mapping without panel-door archaeology.
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            A centralized map for rooms, electrical points, circuits, breaker
            positions, verification history, and advisory load planning.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {plannedFeatures.map((feature) => (
            <div
              className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-cyan-950/20"
              key={feature}
            >
              <p className="text-base font-medium text-slate-100">{feature}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            className="inline-flex h-11 items-center justify-center rounded-full bg-cyan-300 px-5 text-sm font-semibold text-slate-950"
            href="/rooms"
          >
            Browse rooms
          </Link>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-full border border-cyan-300/50 px-5 text-sm font-semibold text-cyan-100"
            href="/circuits"
          >
            Browse circuits
          </Link>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-full border border-cyan-300/50 px-5 text-sm font-semibold text-cyan-100"
            href="/panels"
          >
            Browse panels
          </Link>
          <p className="max-w-2xl text-sm leading-6 text-slate-400">
            Advisory only. Always verify a circuit is de-energized before working
            on electrical wiring. Electricity remains committed to physics.
          </p>
        </div>
      </section>
    </main>
  );
}
