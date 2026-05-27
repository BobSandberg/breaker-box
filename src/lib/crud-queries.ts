import { readFromSupabase } from "./supabase-rest";
import type {
  ElectricalPointKind,
  VerificationStatus,
} from "./breaker-queries";

export const electricalPointKinds: ElectricalPointKind[] = [
  "outlet",
  "light",
  "switch",
  "appliance_feed",
  "hvac",
  "panel",
  "junction",
  "other",
];

export const wallZones = [
  "front",
  "back",
  "left",
  "right",
  "ceiling",
  "floor",
  "exterior",
  "unknown",
  "not_applicable",
] as const;

export const verificationStatuses: VerificationStatus[] = [
  "not_verified",
  "confirmed",
  "contradicted",
  "partial",
  "uncertain",
  "inferred",
];

export const nominalVoltages = ["120", "240", "unknown"] as const;
export const terminalSides = ["left", "right", "top", "bottom", "single", "unknown"] as const;
export const breakerTypes = [
  "standard",
  "tandem",
  "double_pole",
  "gfci",
  "afci",
  "main",
  "unknown",
  "other",
] as const;
export const loadCategories = ["permanent", "current", "possible"] as const;

export type House = {
  id: string;
  name: string;
  orientation_notes: string | null;
};

export type Floor = {
  id: string;
  house_id: string;
  code: string;
  name: string;
  level_order: number;
};

export type Room = {
  id: string;
  house_id: string;
  floor_id: string;
  code: string;
  name: string;
  notes: string | null;
};

export type Panel = {
  id: string;
  house_id: string;
  code: string;
  name: string;
  location_notes: string | null;
};

export type BreakerDevice = {
  id: string;
  panel_id: string;
  label: string | null;
  breaker_type: string;
  manufacturer: string | null;
  model: string | null;
  notes: string | null;
};

export type PanelPosition = {
  id: string;
  panel_id: string;
  breaker_device_id: string | null;
  position_label: string;
  terminal_side: string;
  occupied_spaces: string | null;
  amps: number | null;
  nominal_voltage: "120" | "240" | "unknown";
  poles: number | null;
  notes: string | null;
};

export type Circuit = {
  id: string;
  house_id: string;
  label: string;
  panel_position_id: string | null;
  nominal_voltage: "120" | "240" | "unknown";
  breaker_amps: number | null;
  wire_gauge_awg: number | null;
  wire_limit_watts_override: number | null;
  gfci_status: string | null;
  afci_status: string | null;
  verification_status: VerificationStatus;
  notes: string | null;
};

export type ElectricalPoint = {
  id: string;
  house_id: string;
  room_id: string;
  circuit_id: string | null;
  quick_ref: string;
  kind: ElectricalPointKind;
  label: string;
  wall_zone: string;
  zone_ordinal: number | null;
  verification_status: VerificationStatus;
  notes: string | null;
};

export type LoadType = {
  id: string;
  house_id: string | null;
  name: string;
  watts: number | null;
  volts: number | null;
  amps: number | null;
  horsepower: number | null;
  description: string | null;
};

export type LoadAssignment = {
  id: string;
  electrical_point_id: string;
  load_type_id: string;
  category: "permanent" | "current" | "possible";
  quantity: number;
  watts_override: number | null;
  label: string | null;
  notes: string | null;
};

function activeParams(order: string) {
  return {
    archived_at: "is.null",
    order,
    select: "*",
  };
}

export async function getCrudData() {
  const [
    houses,
    floors,
    rooms,
    panels,
    breakerDevices,
    panelPositions,
    circuits,
    electricalPoints,
    loadTypes,
    loadAssignments,
  ] = await Promise.all([
    readFromSupabase<House[]>("houses", activeParams("name.asc")),
    readFromSupabase<Floor[]>("floors", activeParams("level_order.asc,code.asc")),
    readFromSupabase<Room[]>("rooms", activeParams("name.asc")),
    readFromSupabase<Panel[]>("panels", activeParams("code.asc")),
    readFromSupabase<BreakerDevice[]>("breaker_devices", activeParams("label.asc")),
    readFromSupabase<PanelPosition[]>(
      "panel_positions",
      activeParams("panel_id.asc,position_label.asc,terminal_side.asc"),
    ),
    readFromSupabase<Circuit[]>("circuits", activeParams("label.asc")),
    readFromSupabase<ElectricalPoint[]>("electrical_points", activeParams("quick_ref.asc")),
    readFromSupabase<LoadType[]>("load_types", activeParams("name.asc")),
    readFromSupabase<LoadAssignment[]>(
      "load_assignments",
      activeParams("electrical_point_id.asc,category.asc"),
    ),
  ]);

  return {
    breakerDevices,
    circuits,
    electricalPoints,
    floors,
    houses,
    loadAssignments,
    loadTypes,
    panelPositions,
    panels,
    rooms,
  };
}
