"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeToSupabase } from "./supabase-rest";

type Table =
  | "breaker_devices"
  | "circuits"
  | "electrical_points"
  | "floors"
  | "load_assignments"
  | "load_types"
  | "panel_positions"
  | "panels"
  | "rooms";

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function requiredText(formData: FormData, key: string) {
  const value = text(formData, key);
  if (!value) throw new Error(`${key} is required.`);
  return value;
}

function nullableText(formData: FormData, key: string) {
  const value = text(formData, key);
  return value ? value : null;
}

function nullableNumber(formData: FormData, key: string) {
  const value = text(formData, key);
  return value ? Number(value) : null;
}

function requiredNumber(formData: FormData, key: string) {
  const value = text(formData, key);
  if (!value) throw new Error(`${key} is required.`);
  return Number(value);
}

function nullableId(formData: FormData, key: string) {
  const value = text(formData, key);
  return value ? value : null;
}

function returnTo(formData: FormData) {
  return text(formData, "returnTo") || "/manage";
}

function refreshAndReturn(formData: FormData) {
  revalidatePath("/", "layout");
  redirect(returnTo(formData));
}

async function createRecord(table: Table, body: Record<string, string | number | null>) {
  await writeToSupabase(table, {
    body,
    method: "POST",
  });
}

async function updateRecord(
  table: Table,
  id: string,
  body: Record<string, string | number | null>,
) {
  await writeToSupabase(table, {
    body,
    method: "PATCH",
    params: { id: `eq.${id}` },
  });
}

async function archiveRecord(table: Table, id: string) {
  await updateRecord(table, id, { archived_at: new Date().toISOString() });
}

export async function createFloor(formData: FormData) {
  await createRecord("floors", {
    code: requiredText(formData, "code"),
    house_id: requiredText(formData, "house_id"),
    level_order: requiredNumber(formData, "level_order"),
    name: requiredText(formData, "name"),
  });
  refreshAndReturn(formData);
}

export async function updateFloor(formData: FormData) {
  await updateRecord("floors", requiredText(formData, "id"), {
    code: requiredText(formData, "code"),
    house_id: requiredText(formData, "house_id"),
    level_order: requiredNumber(formData, "level_order"),
    name: requiredText(formData, "name"),
  });
  refreshAndReturn(formData);
}

export async function archiveFloor(formData: FormData) {
  await archiveRecord("floors", requiredText(formData, "id"));
  refreshAndReturn(formData);
}

export async function createRoom(formData: FormData) {
  await createRecord("rooms", {
    code: requiredText(formData, "code"),
    floor_id: requiredText(formData, "floor_id"),
    house_id: requiredText(formData, "house_id"),
    name: requiredText(formData, "name"),
    notes: nullableText(formData, "notes"),
  });
  refreshAndReturn(formData);
}

export async function updateRoom(formData: FormData) {
  await updateRecord("rooms", requiredText(formData, "id"), {
    code: requiredText(formData, "code"),
    floor_id: requiredText(formData, "floor_id"),
    house_id: requiredText(formData, "house_id"),
    name: requiredText(formData, "name"),
    notes: nullableText(formData, "notes"),
  });
  refreshAndReturn(formData);
}

export async function archiveRoom(formData: FormData) {
  await archiveRecord("rooms", requiredText(formData, "id"));
  refreshAndReturn(formData);
}

export async function createPanel(formData: FormData) {
  await createRecord("panels", {
    code: requiredText(formData, "code"),
    house_id: requiredText(formData, "house_id"),
    location_notes: nullableText(formData, "location_notes"),
    name: requiredText(formData, "name"),
  });
  refreshAndReturn(formData);
}

export async function updatePanel(formData: FormData) {
  await updateRecord("panels", requiredText(formData, "id"), {
    code: requiredText(formData, "code"),
    house_id: requiredText(formData, "house_id"),
    location_notes: nullableText(formData, "location_notes"),
    name: requiredText(formData, "name"),
  });
  refreshAndReturn(formData);
}

export async function archivePanel(formData: FormData) {
  await archiveRecord("panels", requiredText(formData, "id"));
  refreshAndReturn(formData);
}

export async function createBreakerDevice(formData: FormData) {
  await createRecord("breaker_devices", {
    breaker_type: requiredText(formData, "breaker_type"),
    label: nullableText(formData, "label"),
    manufacturer: nullableText(formData, "manufacturer"),
    model: nullableText(formData, "model"),
    notes: nullableText(formData, "notes"),
    panel_id: requiredText(formData, "panel_id"),
  });
  refreshAndReturn(formData);
}

export async function updateBreakerDevice(formData: FormData) {
  await updateRecord("breaker_devices", requiredText(formData, "id"), {
    breaker_type: requiredText(formData, "breaker_type"),
    label: nullableText(formData, "label"),
    manufacturer: nullableText(formData, "manufacturer"),
    model: nullableText(formData, "model"),
    notes: nullableText(formData, "notes"),
    panel_id: requiredText(formData, "panel_id"),
  });
  refreshAndReturn(formData);
}

export async function archiveBreakerDevice(formData: FormData) {
  await archiveRecord("breaker_devices", requiredText(formData, "id"));
  refreshAndReturn(formData);
}

export async function createPanelPosition(formData: FormData) {
  await createRecord("panel_positions", {
    amps: nullableNumber(formData, "amps"),
    breaker_device_id: nullableId(formData, "breaker_device_id"),
    nominal_voltage: requiredText(formData, "nominal_voltage"),
    notes: nullableText(formData, "notes"),
    occupied_spaces: nullableText(formData, "occupied_spaces"),
    panel_id: requiredText(formData, "panel_id"),
    poles: nullableNumber(formData, "poles"),
    position_label: requiredText(formData, "position_label"),
    terminal_side: requiredText(formData, "terminal_side"),
  });
  refreshAndReturn(formData);
}

export async function updatePanelPosition(formData: FormData) {
  await updateRecord("panel_positions", requiredText(formData, "id"), {
    amps: nullableNumber(formData, "amps"),
    breaker_device_id: nullableId(formData, "breaker_device_id"),
    nominal_voltage: requiredText(formData, "nominal_voltage"),
    notes: nullableText(formData, "notes"),
    occupied_spaces: nullableText(formData, "occupied_spaces"),
    panel_id: requiredText(formData, "panel_id"),
    poles: nullableNumber(formData, "poles"),
    position_label: requiredText(formData, "position_label"),
    terminal_side: requiredText(formData, "terminal_side"),
  });
  refreshAndReturn(formData);
}

export async function archivePanelPosition(formData: FormData) {
  await archiveRecord("panel_positions", requiredText(formData, "id"));
  refreshAndReturn(formData);
}

export async function createCircuit(formData: FormData) {
  await createRecord("circuits", {
    afci_status: nullableText(formData, "afci_status"),
    breaker_amps: nullableNumber(formData, "breaker_amps"),
    gfci_status: nullableText(formData, "gfci_status"),
    house_id: requiredText(formData, "house_id"),
    label: requiredText(formData, "label"),
    nominal_voltage: requiredText(formData, "nominal_voltage"),
    notes: nullableText(formData, "notes"),
    panel_position_id: nullableId(formData, "panel_position_id"),
    verification_status: requiredText(formData, "verification_status"),
    wire_gauge_awg: nullableNumber(formData, "wire_gauge_awg"),
    wire_limit_watts_override: nullableNumber(formData, "wire_limit_watts_override"),
  });
  refreshAndReturn(formData);
}

export async function updateCircuit(formData: FormData) {
  await updateRecord("circuits", requiredText(formData, "id"), {
    afci_status: nullableText(formData, "afci_status"),
    breaker_amps: nullableNumber(formData, "breaker_amps"),
    gfci_status: nullableText(formData, "gfci_status"),
    house_id: requiredText(formData, "house_id"),
    label: requiredText(formData, "label"),
    nominal_voltage: requiredText(formData, "nominal_voltage"),
    notes: nullableText(formData, "notes"),
    panel_position_id: nullableId(formData, "panel_position_id"),
    verification_status: requiredText(formData, "verification_status"),
    wire_gauge_awg: nullableNumber(formData, "wire_gauge_awg"),
    wire_limit_watts_override: nullableNumber(formData, "wire_limit_watts_override"),
  });
  refreshAndReturn(formData);
}

export async function archiveCircuit(formData: FormData) {
  await archiveRecord("circuits", requiredText(formData, "id"));
  refreshAndReturn(formData);
}

export async function createElectricalPoint(formData: FormData) {
  await createRecord("electrical_points", {
    circuit_id: nullableId(formData, "circuit_id"),
    house_id: requiredText(formData, "house_id"),
    kind: requiredText(formData, "kind"),
    label: requiredText(formData, "label"),
    notes: nullableText(formData, "notes"),
    quick_ref: requiredText(formData, "quick_ref"),
    room_id: requiredText(formData, "room_id"),
    verification_status: requiredText(formData, "verification_status"),
    wall_zone: requiredText(formData, "wall_zone"),
    zone_ordinal: nullableNumber(formData, "zone_ordinal"),
  });
  refreshAndReturn(formData);
}

export async function updateElectricalPoint(formData: FormData) {
  await updateRecord("electrical_points", requiredText(formData, "id"), {
    circuit_id: nullableId(formData, "circuit_id"),
    house_id: requiredText(formData, "house_id"),
    kind: requiredText(formData, "kind"),
    label: requiredText(formData, "label"),
    notes: nullableText(formData, "notes"),
    quick_ref: requiredText(formData, "quick_ref"),
    room_id: requiredText(formData, "room_id"),
    verification_status: requiredText(formData, "verification_status"),
    wall_zone: requiredText(formData, "wall_zone"),
    zone_ordinal: nullableNumber(formData, "zone_ordinal"),
  });
  refreshAndReturn(formData);
}

export async function archiveElectricalPoint(formData: FormData) {
  await archiveRecord("electrical_points", requiredText(formData, "id"));
  refreshAndReturn(formData);
}

export async function createLoadType(formData: FormData) {
  await createRecord("load_types", {
    amps: nullableNumber(formData, "amps"),
    description: nullableText(formData, "description"),
    horsepower: nullableNumber(formData, "horsepower"),
    house_id: nullableId(formData, "house_id"),
    name: requiredText(formData, "name"),
    volts: nullableNumber(formData, "volts"),
    watts: nullableNumber(formData, "watts"),
  });
  refreshAndReturn(formData);
}

export async function updateLoadType(formData: FormData) {
  await updateRecord("load_types", requiredText(formData, "id"), {
    amps: nullableNumber(formData, "amps"),
    description: nullableText(formData, "description"),
    horsepower: nullableNumber(formData, "horsepower"),
    house_id: nullableId(formData, "house_id"),
    name: requiredText(formData, "name"),
    volts: nullableNumber(formData, "volts"),
    watts: nullableNumber(formData, "watts"),
  });
  refreshAndReturn(formData);
}

export async function archiveLoadType(formData: FormData) {
  await archiveRecord("load_types", requiredText(formData, "id"));
  refreshAndReturn(formData);
}

export async function createLoadAssignment(formData: FormData) {
  await createRecord("load_assignments", {
    category: requiredText(formData, "category"),
    electrical_point_id: requiredText(formData, "electrical_point_id"),
    label: nullableText(formData, "label"),
    load_type_id: requiredText(formData, "load_type_id"),
    notes: nullableText(formData, "notes"),
    quantity: requiredNumber(formData, "quantity"),
    watts_override: nullableNumber(formData, "watts_override"),
  });
  refreshAndReturn(formData);
}

export async function updateLoadAssignment(formData: FormData) {
  await updateRecord("load_assignments", requiredText(formData, "id"), {
    category: requiredText(formData, "category"),
    electrical_point_id: requiredText(formData, "electrical_point_id"),
    label: nullableText(formData, "label"),
    load_type_id: requiredText(formData, "load_type_id"),
    notes: nullableText(formData, "notes"),
    quantity: requiredNumber(formData, "quantity"),
    watts_override: nullableNumber(formData, "watts_override"),
  });
  refreshAndReturn(formData);
}

export async function archiveLoadAssignment(formData: FormData) {
  await archiveRecord("load_assignments", requiredText(formData, "id"));
  refreshAndReturn(formData);
}
