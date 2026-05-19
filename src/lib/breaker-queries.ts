import { readFromSupabase } from "./supabase-rest";

export type VerificationStatus =
  | "not_verified"
  | "confirmed"
  | "contradicted"
  | "partial"
  | "uncertain"
  | "inferred";

export type ElectricalPointKind =
  | "outlet"
  | "light"
  | "switch"
  | "appliance_feed"
  | "hvac"
  | "panel"
  | "junction"
  | "other";

export type RoomSummary = {
  room_id: string;
  house_id: string;
  floor_code: string;
  floor_name: string;
  floor_order: number;
  room_code: string;
  room_name: string;
  notes: string | null;
  point_count: number;
  unresolved_count: number;
  confirmed_count: number;
};

export type ElectricalPointLookup = {
  electrical_point_id: string;
  house_id: string;
  floor_code: string;
  floor_name: string;
  floor_order: number;
  room_id: string;
  room_code: string;
  room_name: string;
  quick_ref: string;
  kind: ElectricalPointKind;
  label: string;
  wall_zone: string;
  zone_ordinal: number | null;
  point_verification_status: VerificationStatus;
  notes: string | null;
  circuit_id: string | null;
  circuit_label: string | null;
  circuit_verification_status: VerificationStatus | null;
  circuit_nominal_voltage: "120" | "240" | "unknown" | null;
  breaker_amps: number | null;
  wire_gauge_awg: number | null;
  panel_id: string | null;
  panel_code: string | null;
  panel_name: string | null;
  panel_position_id: string | null;
  position_label: string | null;
  terminal_side: string | null;
  panel_position_amps: number | null;
  panel_position_nominal_voltage: "120" | "240" | "unknown" | null;
};

export async function getRoomSummaries() {
  return readFromSupabase<RoomSummary[]>("room_summaries", {
    select: "*",
    order: "floor_order.asc,room_name.asc",
  });
}

export async function getRoomSummary(roomCode: string) {
  const rows = await readFromSupabase<RoomSummary[]>("room_summaries", {
    select: "*",
    room_code: `eq.${roomCode}`,
    limit: 1,
  });

  return rows[0] ?? null;
}

export async function getElectricalPointsForRoom(roomCode: string) {
  return readFromSupabase<ElectricalPointLookup[]>("electrical_point_lookup", {
    select: "*",
    room_code: `eq.${roomCode}`,
    order: "quick_ref.asc",
  });
}

export function formatElectricalPointKind(kind: ElectricalPointKind) {
  return kind
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatVerificationStatus(status: VerificationStatus | null) {
  if (!status) return "Needs circuit";

  const labels: Record<VerificationStatus, string> = {
    not_verified: "Not verified",
    confirmed: "Confirmed",
    contradicted: "Contradicted",
    partial: "Partial",
    uncertain: "Uncertain",
    inferred: "Inferred",
  };

  return labels[status];
}

export function verificationTone(status: VerificationStatus | null) {
  if (status === "confirmed") return "ok";
  if (status === "contradicted") return "bad";
  if (status === "partial" || status === "uncertain") return "warn";
  if (status === null) return "bad";
  return "info";
}
