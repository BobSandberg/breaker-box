import Link from "next/link";
import { getRoomSummaries } from "@/lib/breaker-queries";

function CountBadge({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-[oklch(0.78_0.015_250)] bg-white px-2.5 py-1 text-xs font-semibold text-[oklch(0.32_0.018_250)]">
      <span className="text-[oklch(0.48_0.018_250)]">{label}</span>
      {value}
    </span>
  );
}

export default async function RoomsPage() {
  const rooms = await getRoomSummaries();
  const totalPoints = rooms.reduce((sum, room) => sum + room.point_count, 0);
  const unresolved = rooms.reduce((sum, room) => sum + room.unresolved_count, 0);

  return (
    <main className="min-h-screen bg-[oklch(0.94_0.01_250)] text-[oklch(0.22_0.018_250)]">
      <header className="border-b border-[oklch(0.82_0.012_250)] bg-[oklch(0.985_0.004_250)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-6 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[oklch(0.42_0.05_245)]">
              Breaker Box
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">
              Rooms
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[oklch(0.42_0.018_250)]">
              Live room-first lookup backed by the local Supabase seed data.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <CountBadge label="Points" value={totalPoints} />
            <CountBadge label="Unresolved" value={unresolved} />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="grid gap-3">
          {rooms.map((room) => (
            <Link
              className="grid gap-3 border border-[oklch(0.84_0.012_250)] bg-[oklch(0.99_0.003_250)] p-4 transition hover:border-[oklch(0.62_0.08_245)] sm:grid-cols-[1fr_auto] sm:items-center"
              href={`/rooms/${room.room_code}`}
              key={room.room_id}
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[oklch(0.48_0.018_250)]">
                  {room.floor_code} / {room.floor_name}
                </p>
                <h2 className="mt-1 text-xl font-semibold">{room.room_name}</h2>
                <p className="mt-1 text-sm text-[oklch(0.46_0.018_250)]">
                  Room code {room.room_code}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 sm:justify-end">
                <CountBadge label="Points" value={room.point_count} />
                <CountBadge label="Confirmed" value={room.confirmed_count} />
                <CountBadge label="Unresolved" value={room.unresolved_count} />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
