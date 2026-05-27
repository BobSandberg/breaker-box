import Link from "next/link";
import {
  archiveBreakerDevice,
  archiveCircuit,
  archiveElectricalPoint,
  archiveFloor,
  archiveLoadAssignment,
  archiveLoadType,
  archivePanel,
  archivePanelPosition,
  archiveRoom,
  createBreakerDevice,
  createCircuit,
  createElectricalPoint,
  createFloor,
  createLoadAssignment,
  createLoadType,
  createPanel,
  createPanelPosition,
  createRoom,
  updateBreakerDevice,
  updateCircuit,
  updateElectricalPoint,
  updateFloor,
  updateLoadAssignment,
  updateLoadType,
  updatePanel,
  updatePanelPosition,
  updateRoom,
} from "@/lib/crud-actions";
import {
  breakerTypes,
  electricalPointKinds,
  getCrudData,
  loadCategories,
  nominalVoltages,
  terminalSides,
  verificationStatuses,
  wallZones,
} from "@/lib/crud-queries";
import { formatElectricalPointKind, formatLoadCategory, formatTerminalSide } from "@/lib/breaker-queries";

const returnTo = "/manage";

type Option = {
  label: string;
  value: string;
};

function fieldClass() {
  return "mt-1 h-10 w-full border border-[oklch(0.78_0.015_250)] bg-white px-3 text-sm text-[oklch(0.22_0.018_250)] outline-none focus:border-[oklch(0.52_0.09_245)]";
}

function areaClass() {
  return "mt-1 min-h-20 w-full border border-[oklch(0.78_0.015_250)] bg-white px-3 py-2 text-sm text-[oklch(0.22_0.018_250)] outline-none focus:border-[oklch(0.52_0.09_245)]";
}

function Label({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block text-sm font-medium text-[oklch(0.44_0.018_250)] ${className}`}>
      {children}
    </label>
  );
}

function TextField({
  defaultValue,
  label,
  name,
  required = false,
}: {
  defaultValue?: string | number | null;
  label: string;
  name: string;
  required?: boolean;
}) {
  return (
    <Label>
      {label}
      <input
        className={fieldClass()}
        defaultValue={defaultValue ?? ""}
        name={name}
        required={required}
      />
    </Label>
  );
}

function NumberField({
  defaultValue,
  label,
  name,
  required = false,
}: {
  defaultValue?: string | number | null;
  label: string;
  name: string;
  required?: boolean;
}) {
  return (
    <Label>
      {label}
      <input
        className={fieldClass()}
        defaultValue={defaultValue ?? ""}
        min={0}
        name={name}
        required={required}
        step="any"
        type="number"
      />
    </Label>
  );
}

function TextArea({
  defaultValue,
  label,
  name,
}: {
  defaultValue?: string | null;
  label: string;
  name: string;
}) {
  return (
    <Label className="sm:col-span-2 lg:col-span-3">
      {label}
      <textarea className={areaClass()} defaultValue={defaultValue ?? ""} name={name} />
    </Label>
  );
}

function SelectField({
  defaultValue,
  includeBlank = false,
  label,
  name,
  options,
  required = false,
}: {
  defaultValue?: string | null;
  includeBlank?: boolean;
  label: string;
  name: string;
  options: Option[];
  required?: boolean;
}) {
  return (
    <Label>
      {label}
      <select
        className={fieldClass()}
        defaultValue={defaultValue ?? ""}
        name={name}
        required={required}
      >
        {includeBlank ? <option value="">None</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Label>
  );
}

function HiddenFields({ id }: { id?: string }) {
  return (
    <>
      <input name="returnTo" type="hidden" value={returnTo} />
      {id ? <input name="id" type="hidden" value={id} /> : null}
    </>
  );
}

function ButtonRow({
  archiveAction,
  id,
  saveLabel = "Save",
}: {
  archiveAction?: (formData: FormData) => Promise<void>;
  id?: string;
  saveLabel?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2 pt-2">
      <button
        className="h-10 border border-[oklch(0.52_0.09_245)] bg-[oklch(0.34_0.07_245)] px-4 text-sm font-semibold text-white"
        type="submit"
      >
        {saveLabel}
      </button>
      {archiveAction && id ? (
        <button
          className="h-10 border border-[oklch(0.72_0.12_35)] px-4 text-sm font-semibold text-[oklch(0.36_0.1_35)]"
          formAction={archiveAction}
          type="submit"
        >
          Archive
        </button>
      ) : null}
    </div>
  );
}

function Section({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="border-t border-[oklch(0.82_0.012_250)] py-8">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-5 grid gap-4">{children}</div>
    </section>
  );
}

function CreatePanel({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="border border-[oklch(0.84_0.012_250)] bg-[oklch(0.99_0.003_250)] p-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function EditPanel({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="border border-[oklch(0.86_0.01_250)] bg-white p-4">
      <h3 className="text-base font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function FormGrid({ children }: { children: React.ReactNode }) {
  return <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

function enumOptions<T extends string>(
  values: readonly T[],
  formatter: (value: T) => string = (value) => value,
) {
  return values.map((value) => ({ label: formatter(value), value }));
}

export default async function ManagePage() {
  const data = await getCrudData();
  const defaultHouseId = data.houses[0]?.id ?? "";
  const houseOptions = data.houses.map((house) => ({ label: house.name, value: house.id }));
  const floorOptions = data.floors.map((floor) => ({
    label: `${floor.code} / ${floor.name}`,
    value: floor.id,
  }));
  const roomOptions = data.rooms.map((room) => ({ label: `${room.code} / ${room.name}`, value: room.id }));
  const panelOptions = data.panels.map((panel) => ({ label: `${panel.code} / ${panel.name}`, value: panel.id }));
  const breakerDeviceOptions = data.breakerDevices.map((device) => ({
    label: device.label ?? "Unlabeled breaker device",
    value: device.id,
  }));
  const panelPositionOptions = data.panelPositions.map((position) => {
    const panel = data.panels.find((candidate) => candidate.id === position.panel_id);
    return {
      label: `${panel?.code ?? "Panel"} ${position.position_label} ${formatTerminalSide(
        position.terminal_side,
      )}`,
      value: position.id,
    };
  });
  const circuitOptions = data.circuits.map((circuit) => ({ label: circuit.label, value: circuit.id }));
  const pointOptions = data.electricalPoints.map((point) => ({
    label: `${point.quick_ref} / ${point.label}`,
    value: point.id,
  }));
  const loadTypeOptions = data.loadTypes.map((loadType) => ({ label: loadType.name, value: loadType.id }));

  return (
    <main className="min-h-screen bg-[oklch(0.94_0.01_250)] text-[oklch(0.22_0.018_250)]">
      <header className="border-b border-[oklch(0.82_0.012_250)] bg-[oklch(0.985_0.004_250)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-6 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link className="text-sm font-semibold text-[oklch(0.36_0.08_245)]" href="/">
              Back home
            </Link>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">
              Manage Data
            </h1>
          </div>
          <nav className="flex flex-wrap gap-2 text-sm font-semibold text-[oklch(0.36_0.08_245)]">
            <a href="#loads">Loads</a>
            <a href="#rooms">Rooms</a>
            <a href="#points">Points</a>
            <a href="#circuits">Circuits</a>
            <a href="#panels">Panels</a>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <Section title="Load Types">
          <div id="loads" />
          <CreatePanel title="New load type">
            <form action={createLoadType}>
              <HiddenFields />
              <FormGrid>
                <SelectField defaultValue={defaultHouseId} includeBlank label="House" name="house_id" options={houseOptions} />
                <TextField label="Name" name="name" required />
                <NumberField label="Watts" name="watts" />
                <NumberField label="Volts" name="volts" />
                <NumberField label="Amps" name="amps" />
                <NumberField label="Horsepower" name="horsepower" />
                <TextArea label="Description" name="description" />
              </FormGrid>
              <ButtonRow saveLabel="Create load type" />
            </form>
          </CreatePanel>
          {data.loadTypes.map((loadType) => (
            <EditPanel key={loadType.id} title={loadType.name}>
              <form action={updateLoadType}>
                <HiddenFields id={loadType.id} />
                <FormGrid>
                  <SelectField defaultValue={loadType.house_id} includeBlank label="House" name="house_id" options={houseOptions} />
                  <TextField defaultValue={loadType.name} label="Name" name="name" required />
                  <NumberField defaultValue={loadType.watts} label="Watts" name="watts" />
                  <NumberField defaultValue={loadType.volts} label="Volts" name="volts" />
                  <NumberField defaultValue={loadType.amps} label="Amps" name="amps" />
                  <NumberField defaultValue={loadType.horsepower} label="Horsepower" name="horsepower" />
                  <TextArea defaultValue={loadType.description} label="Description" name="description" />
                </FormGrid>
                <ButtonRow archiveAction={archiveLoadType} id={loadType.id} />
              </form>
            </EditPanel>
          ))}
        </Section>

        <Section title="Floors And Rooms">
          <div id="rooms" />
          <CreatePanel title="New floor">
            <form action={createFloor}>
              <HiddenFields />
              <FormGrid>
                <SelectField defaultValue={defaultHouseId} label="House" name="house_id" options={houseOptions} required />
                <TextField label="Code" name="code" required />
                <TextField label="Name" name="name" required />
                <NumberField label="Order" name="level_order" required />
              </FormGrid>
              <ButtonRow saveLabel="Create floor" />
            </form>
          </CreatePanel>
          <CreatePanel title="New room">
            <form action={createRoom}>
              <HiddenFields />
              <FormGrid>
                <SelectField defaultValue={defaultHouseId} label="House" name="house_id" options={houseOptions} required />
                <SelectField label="Floor" name="floor_id" options={floorOptions} required />
                <TextField label="Code" name="code" required />
                <TextField label="Name" name="name" required />
                <TextArea label="Notes" name="notes" />
              </FormGrid>
              <ButtonRow saveLabel="Create room" />
            </form>
          </CreatePanel>
          {data.floors.map((floor) => (
            <EditPanel key={floor.id} title={`Floor ${floor.code}`}>
              <form action={updateFloor}>
                <HiddenFields id={floor.id} />
                <FormGrid>
                  <SelectField defaultValue={floor.house_id} label="House" name="house_id" options={houseOptions} required />
                  <TextField defaultValue={floor.code} label="Code" name="code" required />
                  <TextField defaultValue={floor.name} label="Name" name="name" required />
                  <NumberField defaultValue={floor.level_order} label="Order" name="level_order" required />
                </FormGrid>
                <ButtonRow archiveAction={archiveFloor} id={floor.id} />
              </form>
            </EditPanel>
          ))}
          {data.rooms.map((room) => (
            <EditPanel key={room.id} title={`Room ${room.code} / ${room.name}`}>
              <form action={updateRoom}>
                <HiddenFields id={room.id} />
                <FormGrid>
                  <SelectField defaultValue={room.house_id} label="House" name="house_id" options={houseOptions} required />
                  <SelectField defaultValue={room.floor_id} label="Floor" name="floor_id" options={floorOptions} required />
                  <TextField defaultValue={room.code} label="Code" name="code" required />
                  <TextField defaultValue={room.name} label="Name" name="name" required />
                  <TextArea defaultValue={room.notes} label="Notes" name="notes" />
                </FormGrid>
                <ButtonRow archiveAction={archiveRoom} id={room.id} />
              </form>
            </EditPanel>
          ))}
        </Section>

        <Section title="Electrical Points">
          <div id="points" />
          <CreatePanel title="New electrical point">
            <form action={createElectricalPoint}>
              <HiddenFields />
              <FormGrid>
                <SelectField defaultValue={defaultHouseId} label="House" name="house_id" options={houseOptions} required />
                <SelectField label="Room" name="room_id" options={roomOptions} required />
                <SelectField includeBlank label="Circuit" name="circuit_id" options={circuitOptions} />
                <TextField label="Quick ref" name="quick_ref" required />
                <SelectField label="Kind" name="kind" options={enumOptions(electricalPointKinds, formatElectricalPointKind)} required />
                <TextField label="Label" name="label" required />
                <SelectField defaultValue="unknown" label="Wall zone" name="wall_zone" options={enumOptions(wallZones)} required />
                <NumberField label="Zone ordinal" name="zone_ordinal" />
                <SelectField defaultValue="not_verified" label="Verification" name="verification_status" options={enumOptions(verificationStatuses)} required />
                <TextArea label="Notes" name="notes" />
              </FormGrid>
              <ButtonRow saveLabel="Create point" />
            </form>
          </CreatePanel>
          {data.electricalPoints.map((point) => (
            <EditPanel key={point.id} title={`${point.quick_ref} / ${point.label}`}>
              <form action={updateElectricalPoint}>
                <HiddenFields id={point.id} />
                <FormGrid>
                  <SelectField defaultValue={point.house_id} label="House" name="house_id" options={houseOptions} required />
                  <SelectField defaultValue={point.room_id} label="Room" name="room_id" options={roomOptions} required />
                  <SelectField defaultValue={point.circuit_id} includeBlank label="Circuit" name="circuit_id" options={circuitOptions} />
                  <TextField defaultValue={point.quick_ref} label="Quick ref" name="quick_ref" required />
                  <SelectField defaultValue={point.kind} label="Kind" name="kind" options={enumOptions(electricalPointKinds, formatElectricalPointKind)} required />
                  <TextField defaultValue={point.label} label="Label" name="label" required />
                  <SelectField defaultValue={point.wall_zone} label="Wall zone" name="wall_zone" options={enumOptions(wallZones)} required />
                  <NumberField defaultValue={point.zone_ordinal} label="Zone ordinal" name="zone_ordinal" />
                  <SelectField defaultValue={point.verification_status} label="Verification" name="verification_status" options={enumOptions(verificationStatuses)} required />
                  <TextArea defaultValue={point.notes} label="Notes" name="notes" />
                </FormGrid>
                <ButtonRow archiveAction={archiveElectricalPoint} id={point.id} />
              </form>
            </EditPanel>
          ))}
        </Section>

        <Section title="Circuits">
          <div id="circuits" />
          <CreatePanel title="New circuit">
            <form action={createCircuit}>
              <HiddenFields />
              <FormGrid>
                <SelectField defaultValue={defaultHouseId} label="House" name="house_id" options={houseOptions} required />
                <TextField label="Label" name="label" required />
                <SelectField includeBlank label="Panel position" name="panel_position_id" options={panelPositionOptions} />
                <SelectField defaultValue="unknown" label="Voltage" name="nominal_voltage" options={enumOptions(nominalVoltages)} required />
                <NumberField label="Breaker amps" name="breaker_amps" />
                <NumberField label="Wire gauge AWG" name="wire_gauge_awg" />
                <NumberField label="Wire limit override" name="wire_limit_watts_override" />
                <TextField label="GFCI" name="gfci_status" />
                <TextField label="AFCI" name="afci_status" />
                <SelectField defaultValue="not_verified" label="Verification" name="verification_status" options={enumOptions(verificationStatuses)} required />
                <TextArea label="Notes" name="notes" />
              </FormGrid>
              <ButtonRow saveLabel="Create circuit" />
            </form>
          </CreatePanel>
          {data.circuits.map((circuit) => (
            <EditPanel key={circuit.id} title={circuit.label}>
              <form action={updateCircuit}>
                <HiddenFields id={circuit.id} />
                <FormGrid>
                  <SelectField defaultValue={circuit.house_id} label="House" name="house_id" options={houseOptions} required />
                  <TextField defaultValue={circuit.label} label="Label" name="label" required />
                  <SelectField defaultValue={circuit.panel_position_id} includeBlank label="Panel position" name="panel_position_id" options={panelPositionOptions} />
                  <SelectField defaultValue={circuit.nominal_voltage} label="Voltage" name="nominal_voltage" options={enumOptions(nominalVoltages)} required />
                  <NumberField defaultValue={circuit.breaker_amps} label="Breaker amps" name="breaker_amps" />
                  <NumberField defaultValue={circuit.wire_gauge_awg} label="Wire gauge AWG" name="wire_gauge_awg" />
                  <NumberField defaultValue={circuit.wire_limit_watts_override} label="Wire limit override" name="wire_limit_watts_override" />
                  <TextField defaultValue={circuit.gfci_status} label="GFCI" name="gfci_status" />
                  <TextField defaultValue={circuit.afci_status} label="AFCI" name="afci_status" />
                  <SelectField defaultValue={circuit.verification_status} label="Verification" name="verification_status" options={enumOptions(verificationStatuses)} required />
                  <TextArea defaultValue={circuit.notes} label="Notes" name="notes" />
                </FormGrid>
                <ButtonRow archiveAction={archiveCircuit} id={circuit.id} />
              </form>
            </EditPanel>
          ))}
        </Section>

        <Section title="Load Assignments">
          <CreatePanel title="New load assignment">
            <form action={createLoadAssignment}>
              <HiddenFields />
              <FormGrid>
                <SelectField label="Electrical point" name="electrical_point_id" options={pointOptions} required />
                <SelectField label="Load type" name="load_type_id" options={loadTypeOptions} required />
                <SelectField defaultValue="current" label="Category" name="category" options={enumOptions(loadCategories, formatLoadCategory)} required />
                <NumberField defaultValue={1} label="Quantity" name="quantity" required />
                <NumberField label="Watts override" name="watts_override" />
                <TextField label="Label" name="label" />
                <TextArea label="Notes" name="notes" />
              </FormGrid>
              <ButtonRow saveLabel="Create load assignment" />
            </form>
          </CreatePanel>
          {data.loadAssignments.map((assignment) => {
            const point = data.electricalPoints.find((candidate) => candidate.id === assignment.electrical_point_id);
            const loadType = data.loadTypes.find((candidate) => candidate.id === assignment.load_type_id);
            return (
              <EditPanel
                key={assignment.id}
                title={`${point?.quick_ref ?? "Point"} / ${loadType?.name ?? "Load"}`}
              >
                <form action={updateLoadAssignment}>
                  <HiddenFields id={assignment.id} />
                  <FormGrid>
                    <SelectField defaultValue={assignment.electrical_point_id} label="Electrical point" name="electrical_point_id" options={pointOptions} required />
                    <SelectField defaultValue={assignment.load_type_id} label="Load type" name="load_type_id" options={loadTypeOptions} required />
                    <SelectField defaultValue={assignment.category} label="Category" name="category" options={enumOptions(loadCategories, formatLoadCategory)} required />
                    <NumberField defaultValue={assignment.quantity} label="Quantity" name="quantity" required />
                    <NumberField defaultValue={assignment.watts_override} label="Watts override" name="watts_override" />
                    <TextField defaultValue={assignment.label} label="Label" name="label" />
                    <TextArea defaultValue={assignment.notes} label="Notes" name="notes" />
                  </FormGrid>
                  <ButtonRow archiveAction={archiveLoadAssignment} id={assignment.id} />
                </form>
              </EditPanel>
            );
          })}
        </Section>

        <Section title="Panels And Breakers">
          <div id="panels" />
          <CreatePanel title="New panel">
            <form action={createPanel}>
              <HiddenFields />
              <FormGrid>
                <SelectField defaultValue={defaultHouseId} label="House" name="house_id" options={houseOptions} required />
                <TextField label="Code" name="code" required />
                <TextField label="Name" name="name" required />
                <TextArea label="Location notes" name="location_notes" />
              </FormGrid>
              <ButtonRow saveLabel="Create panel" />
            </form>
          </CreatePanel>
          <CreatePanel title="New breaker device">
            <form action={createBreakerDevice}>
              <HiddenFields />
              <FormGrid>
                <SelectField label="Panel" name="panel_id" options={panelOptions} required />
                <TextField label="Label" name="label" />
                <SelectField defaultValue="unknown" label="Type" name="breaker_type" options={enumOptions(breakerTypes)} required />
                <TextField label="Manufacturer" name="manufacturer" />
                <TextField label="Model" name="model" />
                <TextArea label="Notes" name="notes" />
              </FormGrid>
              <ButtonRow saveLabel="Create breaker device" />
            </form>
          </CreatePanel>
          <CreatePanel title="New panel position">
            <form action={createPanelPosition}>
              <HiddenFields />
              <FormGrid>
                <SelectField label="Panel" name="panel_id" options={panelOptions} required />
                <SelectField includeBlank label="Breaker device" name="breaker_device_id" options={breakerDeviceOptions} />
                <TextField label="Position" name="position_label" required />
                <SelectField defaultValue="single" label="Terminal side" name="terminal_side" options={enumOptions(terminalSides, formatTerminalSide)} required />
                <TextField label="Occupied spaces" name="occupied_spaces" />
                <NumberField label="Amps" name="amps" />
                <SelectField defaultValue="unknown" label="Voltage" name="nominal_voltage" options={enumOptions(nominalVoltages)} required />
                <NumberField label="Poles" name="poles" />
                <TextArea label="Notes" name="notes" />
              </FormGrid>
              <ButtonRow saveLabel="Create panel position" />
            </form>
          </CreatePanel>
          {data.panels.map((panel) => (
            <EditPanel key={panel.id} title={`Panel ${panel.code} / ${panel.name}`}>
              <form action={updatePanel}>
                <HiddenFields id={panel.id} />
                <FormGrid>
                  <SelectField defaultValue={panel.house_id} label="House" name="house_id" options={houseOptions} required />
                  <TextField defaultValue={panel.code} label="Code" name="code" required />
                  <TextField defaultValue={panel.name} label="Name" name="name" required />
                  <TextArea defaultValue={panel.location_notes} label="Location notes" name="location_notes" />
                </FormGrid>
                <ButtonRow archiveAction={archivePanel} id={panel.id} />
              </form>
            </EditPanel>
          ))}
          {data.breakerDevices.map((device) => (
            <EditPanel key={device.id} title={`Breaker ${device.label ?? "Unlabeled"}`}>
              <form action={updateBreakerDevice}>
                <HiddenFields id={device.id} />
                <FormGrid>
                  <SelectField defaultValue={device.panel_id} label="Panel" name="panel_id" options={panelOptions} required />
                  <TextField defaultValue={device.label} label="Label" name="label" />
                  <SelectField defaultValue={device.breaker_type} label="Type" name="breaker_type" options={enumOptions(breakerTypes)} required />
                  <TextField defaultValue={device.manufacturer} label="Manufacturer" name="manufacturer" />
                  <TextField defaultValue={device.model} label="Model" name="model" />
                  <TextArea defaultValue={device.notes} label="Notes" name="notes" />
                </FormGrid>
                <ButtonRow archiveAction={archiveBreakerDevice} id={device.id} />
              </form>
            </EditPanel>
          ))}
          {data.panelPositions.map((position) => {
            const panel = data.panels.find((candidate) => candidate.id === position.panel_id);
            return (
              <EditPanel
                key={position.id}
                title={`${panel?.code ?? "Panel"} ${position.position_label} ${formatTerminalSide(
                  position.terminal_side,
                )}`}
              >
                <form action={updatePanelPosition}>
                  <HiddenFields id={position.id} />
                  <FormGrid>
                    <SelectField defaultValue={position.panel_id} label="Panel" name="panel_id" options={panelOptions} required />
                    <SelectField defaultValue={position.breaker_device_id} includeBlank label="Breaker device" name="breaker_device_id" options={breakerDeviceOptions} />
                    <TextField defaultValue={position.position_label} label="Position" name="position_label" required />
                    <SelectField defaultValue={position.terminal_side} label="Terminal side" name="terminal_side" options={enumOptions(terminalSides, formatTerminalSide)} required />
                    <TextField defaultValue={position.occupied_spaces} label="Occupied spaces" name="occupied_spaces" />
                    <NumberField defaultValue={position.amps} label="Amps" name="amps" />
                    <SelectField defaultValue={position.nominal_voltage} label="Voltage" name="nominal_voltage" options={enumOptions(nominalVoltages)} required />
                    <NumberField defaultValue={position.poles} label="Poles" name="poles" />
                    <TextArea defaultValue={position.notes} label="Notes" name="notes" />
                  </FormGrid>
                  <ButtonRow archiveAction={archivePanelPosition} id={position.id} />
                </form>
              </EditPanel>
            );
          })}
        </Section>
      </div>
    </main>
  );
}
