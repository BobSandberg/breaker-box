import Link from "next/link";

const flows = [
  "Dashboard",
  "Room lookup",
  "Point detail",
  "Circuit detail",
  "Panel view",
  "What-if load",
  "Verify",
  "Setup",
];

const rooms = [
  { code: "Ki", name: "Kitchen", count: 24, unresolved: 3 },
  { code: "BR", name: "Bonus Room", count: 15, unresolved: 2 },
  { code: "UR", name: "Utility Room", count: 8, unresolved: 1 },
  { code: "MB", name: "Master Bath", count: 7, unresolved: 0 },
];

const roomPoints = [
  {
    ref: "F-Ki-O02",
    label: "Outlet back left",
    circuit: "Kitchen counter left",
    status: "Confirmed",
    tone: "ok",
  },
  {
    ref: "F-Ki-O10",
    label: "Outlet stove middle",
    circuit: "Kitchen small appliance",
    status: "Confirmed",
    tone: "ok",
  },
  {
    ref: "F-Ki-L01",
    label: "Island lights",
    circuit: "First floor lighting",
    status: "Not verified",
    tone: "warn",
  },
  {
    ref: "F-Ki-O14",
    label: "Outlet near pantry",
    circuit: "Unassigned",
    status: "Needs circuit",
    tone: "bad",
  },
];

const servedPoints = [
  "F-Ki-O01 Outlet back right",
  "F-Ki-O02 Outlet back left",
  "F-D-O03 Dining outlet",
  "F-Ki-O03 Counter outlet",
];

const panelPositions = [
  ["1", "Main feed", "100A", "Main"],
  ["2+4", "Kitchen range", "40A", "240V"],
  ["10 L", "Kitchen counter left", "20A", "Confirmed"],
  ["10 R", "Spare", "15A", "Open"],
  ["17 L", "First floor mixed", "15A", "Unclear"],
  ["17 R", "First floor mixed", "15A", "Unclear"],
];

function StatusBadge({ tone, children }: { tone: "ok" | "warn" | "bad" | "info"; children: React.ReactNode }) {
  const styles = {
    ok: "border-[oklch(0.74_0.08_155)] bg-[oklch(0.96_0.025_155)] text-[oklch(0.34_0.08_155)]",
    warn: "border-[oklch(0.78_0.13_78)] bg-[oklch(0.96_0.035_78)] text-[oklch(0.38_0.09_78)]",
    bad: "border-[oklch(0.72_0.12_35)] bg-[oklch(0.96_0.03_35)] text-[oklch(0.36_0.1_35)]",
    info: "border-[oklch(0.72_0.08_245)] bg-[oklch(0.96_0.025_245)] text-[oklch(0.34_0.08_245)]",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[tone]}`}>
      {children}
    </span>
  );
}

function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6 rounded-[2rem] border border-[oklch(0.82_0.01_250)] bg-[oklch(0.985_0.004_250)] p-5 shadow-sm sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[oklch(0.42_0.04_250)]">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[oklch(0.22_0.018_250)]">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[390px] rounded-[2.3rem] border border-[oklch(0.74_0.015_250)] bg-[oklch(0.2_0.014_250)] p-3 shadow-xl shadow-[oklch(0.62_0.02_250_/_0.25)]">
      <div className="overflow-hidden rounded-[1.7rem] bg-[oklch(0.985_0.004_250)] text-[oklch(0.22_0.018_250)]">
        {children}
      </div>
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-3 border-t border-[oklch(0.88_0.008_250)] py-3 text-sm first:border-t-0">
      <dt className="font-medium text-[oklch(0.46_0.018_250)]">{label}</dt>
      <dd className="font-semibold text-[oklch(0.24_0.018_250)]">{value}</dd>
    </div>
  );
}

export default function WireframesPage() {
  return (
    <main className="min-h-screen bg-[oklch(0.94_0.01_250)] text-[oklch(0.22_0.018_250)]">
      <header className="border-b border-[oklch(0.82_0.012_250)] bg-[oklch(0.985_0.004_250)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-6 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[oklch(0.42_0.05_245)]">Breaker Box</p>
            <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">Wireframes for the working app</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[oklch(0.42_0.018_250)]">
              Low-fidelity screens for lookup, mapping, load planning, and verification. The mocks favor task clarity over decoration.
            </p>
          </div>
          <Link className="inline-flex h-11 items-center justify-center rounded-full bg-[oklch(0.34_0.09_245)] px-5 text-sm font-semibold text-[oklch(0.98_0.004_245)]" href="/">
            Back home
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[16rem_1fr]">
        <aside className="lg:sticky lg:top-6 lg:h-fit">
          <nav className="rounded-3xl border border-[oklch(0.82_0.012_250)] bg-[oklch(0.985_0.004_250)] p-3">
            <p className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[oklch(0.48_0.018_250)]">Flows</p>
            <div className="grid gap-1">
              {flows.map((flow) => (
                <a className="rounded-2xl px-3 py-2.5 text-sm font-medium text-[oklch(0.27_0.018_250)] hover:bg-[oklch(0.94_0.012_250)]" href={`#${flow.toLowerCase().replaceAll(" ", "-")}`} key={flow}>
                  {flow}
                </a>
              ))}
            </div>
          </nav>
        </aside>

        <div className="grid gap-6">
          <Section id="dashboard" eyebrow="Flow 01" title="Dashboard: what needs attention">
            <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl border border-[oklch(0.84_0.01_250)] bg-[oklch(0.97_0.006_250)] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">Today&apos;s working list</h3>
                    <p className="mt-1 text-sm text-[oklch(0.46_0.018_250)]">Uncertainty is surfaced first.</p>
                  </div>
                  <StatusBadge tone="warn">7 unresolved</StatusBadge>
                </div>
                <div className="mt-5 grid gap-3">
                  {[
                    ["Assign breaker", "T-BR-HP04 Mini split", "High load, no circuit"],
                    ["Verify", "F-Ki-L01 Island lights", "Circuit assigned, not tested"],
                    ["Add wattage", "Heat Pump Attic", "Load total incomplete"],
                  ].map(([action, item, reason]) => (
                    <div className="rounded-2xl border border-[oklch(0.84_0.012_250)] bg-[oklch(0.99_0.003_250)] p-4" key={item}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[oklch(0.45_0.05_245)]">{action}</p>
                          <p className="mt-1 font-semibold">{item}</p>
                          <p className="mt-1 text-sm text-[oklch(0.46_0.018_250)]">{reason}</p>
                        </div>
                        <button className="rounded-full border border-[oklch(0.78_0.015_250)] px-3 py-1.5 text-sm font-semibold">Open</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
                <div className="rounded-3xl border border-[oklch(0.84_0.012_250)] bg-[oklch(0.99_0.003_250)] p-5">
                  <p className="text-sm text-[oklch(0.46_0.018_250)]">Verified points</p>
                  <p className="mt-2 text-3xl font-semibold">126</p>
                </div>
                <div className="rounded-3xl border border-[oklch(0.84_0.012_250)] bg-[oklch(0.99_0.003_250)] p-5">
                  <p className="text-sm text-[oklch(0.46_0.018_250)]">Unknown gauge</p>
                  <p className="mt-2 text-3xl font-semibold">9</p>
                </div>
                <div className="rounded-3xl border border-[oklch(0.84_0.012_250)] bg-[oklch(0.99_0.003_250)] p-5">
                  <p className="text-sm text-[oklch(0.46_0.018_250)]">Load warnings</p>
                  <p className="mt-2 text-3xl font-semibold">3</p>
                </div>
              </div>
            </div>
          </Section>

          <Section id="room-lookup" eyebrow="Flow 02" title="Room lookup on a phone">
            <div className="grid items-start gap-8 lg:grid-cols-[420px_1fr]">
              <PhoneFrame>
                <div className="border-b border-[oklch(0.86_0.01_250)] px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[oklch(0.46_0.018_250)]">First floor</p>
                  <h3 className="mt-1 text-xl font-semibold">Kitchen</h3>
                </div>
                <div className="px-4 py-4">
                  <label className="block text-sm font-medium" htmlFor="point-search">Find point</label>
                  <div className="mt-2 rounded-2xl border border-[oklch(0.78_0.012_250)] bg-[oklch(0.99_0.003_250)] px-4 py-3 text-sm text-[oklch(0.48_0.018_250)]" id="point-search">Search outlet, light, quick-ref</div>
                  <div className="mt-4 grid gap-3">
                    {roomPoints.map((point) => (
                      <button className="rounded-2xl border border-[oklch(0.84_0.012_250)] bg-[oklch(0.995_0.003_250)] p-4 text-left" key={point.ref}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold">{point.label}</p>
                            <p className="mt-1 text-sm text-[oklch(0.48_0.018_250)]">{point.ref}</p>
                            <p className="mt-2 text-sm">{point.circuit}</p>
                          </div>
                          <StatusBadge tone={point.tone as "ok" | "warn" | "bad"}>{point.status}</StatusBadge>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </PhoneFrame>
              <div>
                <h3 className="text-lg font-semibold">Room list supports physical lookup</h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[oklch(0.44_0.018_250)]">
                  The mobile path starts where the user is standing. The row combines human label, quick-ref, circuit, and verification status without making color do all the work.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {rooms.map((room) => (
                    <div className="rounded-3xl border border-[oklch(0.84_0.012_250)] bg-[oklch(0.99_0.003_250)] p-4" key={room.code}>
                      <p className="text-sm font-semibold text-[oklch(0.46_0.018_250)]">{room.code}</p>
                      <p className="mt-1 text-lg font-semibold">{room.name}</p>
                      <p className="mt-2 text-sm text-[oklch(0.48_0.018_250)]">{room.count} points, {room.unresolved} unresolved</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <Section id="point-detail" eyebrow="Flow 03" title="Electrical point detail">
            <div className="grid gap-5 lg:grid-cols-[1fr_18rem]">
              <div className="rounded-3xl border border-[oklch(0.84_0.012_250)] bg-[oklch(0.99_0.003_250)] p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-[oklch(0.46_0.018_250)]">F-Ki-O02</p>
                    <h3 className="mt-1 text-2xl font-semibold">Outlet back left</h3>
                    <p className="mt-2 text-sm text-[oklch(0.46_0.018_250)]">Kitchen, back wall, second outlet from left</p>
                  </div>
                  <StatusBadge tone="ok">Confirmed</StatusBadge>
                </div>
                <dl className="mt-6">
                  <DataRow label="Circuit" value="Kitchen counter left" />
                  <DataRow label="Panel" value="Main panel, position 10 left" />
                  <DataRow label="Breaker" value="20A, 120V, tandem terminal" />
                  <DataRow label="Wire" value="12 AWG, verified at panel" />
                  <DataRow label="Last verified" value="Breaker-off test by Thurston, Mar 18" />
                </dl>
              </div>
              <div className="rounded-3xl border border-[oklch(0.84_0.012_250)] bg-[oklch(0.97_0.006_250)] p-5">
                <h3 className="font-semibold">Attached loads</h3>
                <div className="mt-4 grid gap-3 text-sm">
                  <div className="rounded-2xl bg-[oklch(0.995_0.003_250)] p-3">
                    <p className="font-semibold">Coffee grinder</p>
                    <p className="text-[oklch(0.48_0.018_250)]">Current, 300 W</p>
                  </div>
                  <div className="rounded-2xl bg-[oklch(0.995_0.003_250)] p-3">
                    <p className="font-semibold">Electric kettle</p>
                    <p className="text-[oklch(0.48_0.018_250)]">Possible, 1800 W</p>
                  </div>
                </div>
                <button className="mt-5 h-11 w-full rounded-full bg-[oklch(0.34_0.09_245)] px-4 text-sm font-semibold text-[oklch(0.98_0.004_245)]">Verify again</button>
              </div>
            </div>
          </Section>

          <Section id="circuit-detail" eyebrow="Flow 04" title="Circuit detail and load headroom">
            <div className="grid gap-5 xl:grid-cols-[1fr_22rem]">
              <div className="rounded-3xl border border-[oklch(0.84_0.012_250)] bg-[oklch(0.99_0.003_250)] p-5">
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold">Kitchen counter left</h3>
                    <p className="mt-1 text-sm text-[oklch(0.46_0.018_250)]">Main panel, 10 left, 20A, 12 AWG</p>
                  </div>
                  <StatusBadge tone="warn">Worst case 87%</StatusBadge>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-4">
                  {[
                    ["Installed", "0 W"],
                    ["Current", "300 W"],
                    ["Possible", "1800 W"],
                    ["Worst case", "2100 W"],
                  ].map(([label, value]) => (
                    <div className="rounded-2xl border border-[oklch(0.84_0.012_250)] bg-[oklch(0.985_0.004_250)] p-4" key={label}>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[oklch(0.48_0.018_250)]">{label}</p>
                      <p className="mt-2 text-2xl font-semibold">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 h-4 overflow-hidden rounded-full bg-[oklch(0.9_0.012_250)]">
                  <div className="h-full w-[87%] rounded-full bg-[oklch(0.72_0.13_78)]" />
                </div>
                <p className="mt-3 text-sm text-[oklch(0.44_0.018_250)]">Warning starts at 80% of the effective advisory limit. Unknown loads would mark this summary incomplete.</p>
              </div>
              <div className="rounded-3xl border border-[oklch(0.84_0.012_250)] bg-[oklch(0.97_0.006_250)] p-5">
                <h3 className="font-semibold">Served points</h3>
                <ul className="mt-4 grid gap-2 text-sm">
                  {servedPoints.map((point) => (
                    <li className="rounded-2xl bg-[oklch(0.995_0.003_250)] px-3 py-2.5" key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          <Section id="panel-view" eyebrow="Flow 05" title="Panel view: positions before labels">
            <div className="overflow-hidden rounded-3xl border border-[oklch(0.82_0.012_250)] bg-[oklch(0.99_0.003_250)]">
              <div className="grid grid-cols-[7rem_1fr_6rem_7rem] border-b border-[oklch(0.84_0.012_250)] bg-[oklch(0.94_0.012_250)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[oklch(0.44_0.018_250)]">
                <span>Position</span>
                <span>Circuit</span>
                <span>Rating</span>
                <span>Status</span>
              </div>
              {panelPositions.map(([position, circuit, rating, status]) => (
                <div className="grid grid-cols-[7rem_1fr_6rem_7rem] border-b border-[oklch(0.9_0.008_250)] px-4 py-4 text-sm last:border-b-0" key={position}>
                  <span className="font-semibold">{position}</span>
                  <span>{circuit}</span>
                  <span>{rating}</span>
                  <span className="text-[oklch(0.46_0.018_250)]">{status}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section id="what-if-load" eyebrow="Flow 06" title="What-if load planning">
            <div className="grid gap-5 lg:grid-cols-[22rem_1fr]">
              <div className="rounded-3xl border border-[oklch(0.84_0.012_250)] bg-[oklch(0.99_0.003_250)] p-5">
                <h3 className="font-semibold">Add a possible load</h3>
                <div className="mt-4 grid gap-3 text-sm">
                  <div className="rounded-2xl border border-[oklch(0.8_0.012_250)] px-4 py-3">Load type: Toaster oven</div>
                  <div className="rounded-2xl border border-[oklch(0.8_0.012_250)] px-4 py-3">Watts: 1500</div>
                  <div className="rounded-2xl border border-[oklch(0.8_0.012_250)] px-4 py-3">Circuit: Kitchen counter left</div>
                </div>
                <button className="mt-5 h-11 w-full rounded-full bg-[oklch(0.34_0.09_245)] text-sm font-semibold text-[oklch(0.98_0.004_245)]">Calculate</button>
              </div>
              <div className="rounded-3xl border border-[oklch(0.78_0.13_78)] bg-[oklch(0.97_0.028_78)] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-xl font-semibold">Projected result</h3>
                  <StatusBadge tone="bad">Critical over limit</StatusBadge>
                </div>
                <dl className="mt-5">
                  <DataRow label="Current worst" value="2100 W" />
                  <DataRow label="New load" value="1500 W" />
                  <DataRow label="Projected" value="3600 W" />
                  <DataRow label="Advisory limit" value="2400 W" />
                </dl>
                <p className="mt-4 text-sm leading-6 text-[oklch(0.38_0.09_78)]">This scenario exceeds the advisory limit. Use another circuit or remove selected possible loads.</p>
              </div>
            </div>
          </Section>

          <Section id="verify" eyebrow="Flow 07" title="Verification as a normal action">
            <div className="grid gap-5 lg:grid-cols-3">
              {[
                ["1", "Select result", "Confirmed is the fast default, with contradicted, partial, and uncertain available."],
                ["2", "Capture method", "Breaker-off test, tester, continuity, electrician, inferred, or other."],
                ["3", "Save evidence", "Verifier name persists. Circuit and panel position are inferred and saved as history."],
              ].map(([number, title, body]) => (
                <div className="rounded-3xl border border-[oklch(0.84_0.012_250)] bg-[oklch(0.99_0.003_250)] p-5" key={number}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[oklch(0.88_0.035_245)] text-sm font-bold text-[oklch(0.32_0.08_245)]">{number}</div>
                  <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[oklch(0.44_0.018_250)]">{body}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="setup" eyebrow="Flow 08" title="Guided setup, not free-form drift">
            <div className="rounded-3xl border border-[oklch(0.84_0.012_250)] bg-[oklch(0.99_0.003_250)] p-5">
              <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  "House",
                  "Floors",
                  "Rooms",
                  "Panels",
                  "Circuits",
                  "Points",
                  "Loads",
                  "Verify",
                  "Warnings",
                  "Review",
                ].map((step, index) => (
                  <li className="rounded-2xl border border-[oklch(0.84_0.012_250)] bg-[oklch(0.985_0.004_250)] p-4" key={step}>
                    <p className="text-xs font-semibold text-[oklch(0.46_0.018_250)]">Step {index + 1}</p>
                    <p className="mt-1 font-semibold">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </Section>
        </div>
      </div>
    </main>
  );
}
