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

export async function getElectricalPointByQuickRef(quickRef: string) {
  const rows = await readFromSupabase<ElectricalPointLookup[]>(
    "electrical_point_lookup",
    {
      select: "*",
      quick_ref: `eq.${quickRef}`,
      limit: 1,
    },
  );

  return rows[0] ?? null;
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

export function formatTerminalSide(side: string | null) {
  if (!side) return "Unassigned";
  return side[0].toUpperCase() + side.slice(1);
}

export function verificationTone(status: VerificationStatus | null) {
  if (status === "confirmed") return "ok";
  if (status === "contradicted") return "bad";
  if (status === "partial" || status === "uncertain") return "warn";
  if (status === null) return "bad";
  return "info";
}

export type LoadWarningLevel = "unknown" | "ok" | "warning" | "critical";

export function formatWatts(watts: number | null) {
  if (watts === null) return "Unknown";
  return `${Number(watts).toLocaleString()} W`;
}

export function loadWarningTone(level: LoadWarningLevel) {
  if (level === "critical") return "bad";
  if (level === "warning" || level === "unknown") return "warn";
  return "ok";
}

export function formatLoadWarning(level: LoadWarningLevel) {
  const labels: Record<LoadWarningLevel, string> = {
    unknown: "Incomplete",
    ok: "OK",
    warning: "Warning",
    critical: "Critical",
  };

  return labels[level];
}

export function formatLoadCategory(category: "permanent" | "current" | "possible") {
  return category[0].toUpperCase() + category.slice(1);
}

export type CircuitSummary = {
  circuit_id: string;
  house_id: string;
  circuit_label: string;
  verification_status: VerificationStatus;
  nominal_voltage: "120" | "240" | "unknown";
  breaker_amps: number | null;
  wire_gauge_awg: number | null;
  gfci_status: string | null;
  afci_status: string | null;
  notes: string | null;
  panel_id: string | null;
  panel_code: string | null;
  panel_name: string | null;
  panel_position_id: string | null;
  position_label: string | null;
  terminal_side: string | null;
  panel_position_amps: number | null;
  panel_position_nominal_voltage: "120" | "240" | "unknown" | null;
  point_count: number;
  unresolved_point_count: number;
};

export type PanelPositionLookup = {
  panel_position_id: string;
  panel_id: string;
  house_id: string;
  panel_code: string;
  panel_name: string;
  location_notes: string | null;
  position_label: string;
  terminal_side: string;
  occupied_spaces: string | null;
  amps: number | null;
  nominal_voltage: "120" | "240" | "unknown";
  poles: number | null;
  notes: string | null;
  breaker_device_id: string | null;
  breaker_device_label: string | null;
  breaker_type: string | null;
  circuit_id: string | null;
  circuit_label: string | null;
  circuit_verification_status: VerificationStatus | null;
  breaker_amps: number | null;
  wire_gauge_awg: number | null;
  served_point_count: number;
};

export async function getCircuitSummaries() {
  return readFromSupabase<CircuitSummary[]>("circuit_summaries", {
    select: "*",
    order: "circuit_label.asc",
  });
}

export async function getCircuitSummary(circuitId: string) {
  const rows = await readFromSupabase<CircuitSummary[]>("circuit_summaries", {
    select: "*",
    circuit_id: `eq.${circuitId}`,
    limit: 1,
  });

  return rows[0] ?? null;
}

export async function getElectricalPointsForCircuit(circuitId: string) {
  return readFromSupabase<ElectricalPointLookup[]>("electrical_point_lookup", {
    select: "*",
    circuit_id: `eq.${circuitId}`,
    order: "quick_ref.asc",
  });
}

export async function getPanelPositions(panelCode?: string) {
  const params: Record<string, string> = {
    select: "*",
    order: "panel_code.asc,position_label.asc,terminal_side.asc",
  };

  if (panelCode) params.panel_code = `eq.${panelCode}`;

  return readFromSupabase<PanelPositionLookup[]>("panel_position_lookup", params);
}

export async function getPanelSummary(panelCode: string) {
  const positions = await getPanelPositions(panelCode);
  return positions[0] ?? null;
}

export type ElectricalPointLoad = {
  load_assignment_id: string;
  electrical_point_id: string;
  quick_ref: string;
  circuit_id: string | null;
  load_type_id: string;
  load_type_name: string;
  category: "permanent" | "current" | "possible";
  quantity: number;
  watts_override: number | null;
  catalog_watts: number | null;
  volts: number | null;
  amps: number | null;
  effective_watts: number | null;
  has_unknown_wattage: boolean;
  label: string | null;
  notes: string | null;
};

export type CircuitLoadSummary = {
  circuit_id: string;
  house_id: string;
  circuit_label: string;
  nominal_voltage: "120" | "240" | "unknown";
  breaker_amps: number | null;
  wire_gauge_awg: number | null;
  permanent_known_watts: number;
  permanent_unknown_count: number;
  current_known_watts: number;
  current_unknown_count: number;
  possible_known_watts: number;
  possible_unknown_count: number;
  worst_case_known_watts: number;
  worst_case_unknown_count: number;
  breaker_limit_watts: number | null;
  wire_limit_watts: number | null;
  effective_limit_watts: number | null;
  warning_level: LoadWarningLevel;
};

export async function getCircuitLoadSummary(circuitId: string) {
  const rows = await readFromSupabase<CircuitLoadSummary[]>(
    "circuit_load_summaries",
    {
      select: "*",
      circuit_id: `eq.${circuitId}`,
      limit: 1,
    },
  );

  return rows[0] ?? null;
}

export async function getElectricalPointLoads(quickRef: string) {
  return readFromSupabase<ElectricalPointLoad[]>("electrical_point_loads", {
    select: "*",
    quick_ref: `eq.${quickRef}`,
    order: "category.asc,load_type_name.asc",
  });
}
