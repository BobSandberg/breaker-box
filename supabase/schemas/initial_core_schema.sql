create extension if not exists pgcrypto;

create type public.electrical_point_kind as enum (
  'outlet',
  'light',
  'switch',
  'appliance_feed',
  'hvac',
  'panel',
  'junction',
  'other'
);

create type public.wall_zone as enum (
  'front',
  'back',
  'left',
  'right',
  'ceiling',
  'floor',
  'exterior',
  'unknown',
  'not_applicable'
);

create type public.verification_status as enum (
  'not_verified',
  'confirmed',
  'contradicted',
  'partial',
  'uncertain',
  'inferred'
);

create type public.breaker_type as enum (
  'standard',
  'tandem',
  'double_pole',
  'gfci',
  'afci',
  'main',
  'unknown',
  'other'
);

create type public.nominal_voltage as enum (
  '120',
  '240',
  'unknown'
);

create type public.terminal_side as enum (
  'left',
  'right',
  'top',
  'bottom',
  'single',
  'unknown'
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.houses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  orientation_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.floors (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references public.houses(id),
  code text not null,
  name text not null,
  level_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint floors_house_code_key unique (house_id, code),
  constraint floors_house_level_order_key unique (house_id, level_order)
);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references public.houses(id),
  floor_id uuid not null references public.floors(id),
  code text not null,
  name text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint rooms_house_code_key unique (house_id, code)
);

create table public.panels (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references public.houses(id),
  code text not null,
  name text not null,
  location_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint panels_house_code_key unique (house_id, code)
);

create table public.breaker_devices (
  id uuid primary key default gen_random_uuid(),
  panel_id uuid not null references public.panels(id),
  label text,
  breaker_type public.breaker_type not null default 'unknown',
  manufacturer text,
  model text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.panel_positions (
  id uuid primary key default gen_random_uuid(),
  panel_id uuid not null references public.panels(id),
  breaker_device_id uuid references public.breaker_devices(id),
  position_label text not null,
  terminal_side public.terminal_side not null default 'single',
  occupied_spaces text,
  amps numeric,
  nominal_voltage public.nominal_voltage not null default 'unknown',
  poles integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint panel_positions_panel_position_terminal_key unique (
    panel_id,
    position_label,
    terminal_side
  ),
  constraint panel_positions_amps_positive check (amps is null or amps > 0),
  constraint panel_positions_poles_positive check (poles is null or poles > 0)
);

create table public.circuits (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references public.houses(id),
  label text not null,
  panel_position_id uuid references public.panel_positions(id),
  nominal_voltage public.nominal_voltage not null default 'unknown',
  breaker_amps numeric,
  wire_gauge_awg integer,
  wire_limit_watts_override numeric,
  gfci_status text,
  afci_status text,
  verification_status public.verification_status not null default 'not_verified',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint circuits_house_label_key unique (house_id, label),
  constraint circuits_breaker_amps_positive check (
    breaker_amps is null or breaker_amps > 0
  ),
  constraint circuits_wire_gauge_positive check (
    wire_gauge_awg is null or wire_gauge_awg > 0
  ),
  constraint circuits_wire_limit_positive check (
    wire_limit_watts_override is null or wire_limit_watts_override > 0
  )
);

create table public.electrical_points (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references public.houses(id),
  room_id uuid not null references public.rooms(id),
  circuit_id uuid references public.circuits(id),
  quick_ref text not null,
  kind public.electrical_point_kind not null,
  label text not null,
  wall_zone public.wall_zone not null default 'unknown',
  zone_ordinal integer,
  verification_status public.verification_status not null default 'not_verified',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint electrical_points_house_quick_ref_key unique (house_id, quick_ref),
  constraint electrical_points_zone_ordinal_positive check (
    zone_ordinal is null or zone_ordinal > 0
  )
);

create index floors_house_id_idx on public.floors(house_id);
create index rooms_house_id_idx on public.rooms(house_id);
create index rooms_floor_id_idx on public.rooms(floor_id);
create index panels_house_id_idx on public.panels(house_id);
create index breaker_devices_panel_id_idx on public.breaker_devices(panel_id);
create index panel_positions_panel_id_idx on public.panel_positions(panel_id);
create index circuits_house_id_idx on public.circuits(house_id);
create index circuits_panel_position_id_idx on public.circuits(panel_position_id);
create index electrical_points_house_id_idx on public.electrical_points(house_id);
create index electrical_points_room_id_idx on public.electrical_points(room_id);
create index electrical_points_circuit_id_idx on public.electrical_points(circuit_id);
create index electrical_points_kind_idx on public.electrical_points(kind);
create index electrical_points_verification_status_idx
  on public.electrical_points(verification_status);

create trigger set_houses_updated_at
before update on public.houses
for each row execute function public.set_updated_at();

create trigger set_floors_updated_at
before update on public.floors
for each row execute function public.set_updated_at();

create trigger set_rooms_updated_at
before update on public.rooms
for each row execute function public.set_updated_at();

create trigger set_panels_updated_at
before update on public.panels
for each row execute function public.set_updated_at();

create trigger set_breaker_devices_updated_at
before update on public.breaker_devices
for each row execute function public.set_updated_at();

create trigger set_panel_positions_updated_at
before update on public.panel_positions
for each row execute function public.set_updated_at();

create trigger set_circuits_updated_at
before update on public.circuits
for each row execute function public.set_updated_at();

create trigger set_electrical_points_updated_at
before update on public.electrical_points
for each row execute function public.set_updated_at();
