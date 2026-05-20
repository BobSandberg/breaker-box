create type public.load_assignment_category as enum (
  'permanent',
  'current',
  'possible'
);

create table public.load_types (
  id uuid primary key default gen_random_uuid(),
  house_id uuid references public.houses(id),
  name text not null,
  watts numeric,
  volts numeric,
  amps numeric,
  horsepower numeric,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint load_types_house_name_key unique (house_id, name),
  constraint load_types_watts_nonnegative check (watts is null or watts >= 0),
  constraint load_types_volts_positive check (volts is null or volts > 0),
  constraint load_types_amps_nonnegative check (amps is null or amps >= 0),
  constraint load_types_horsepower_nonnegative check (
    horsepower is null or horsepower >= 0
  )
);

create table public.load_assignments (
  id uuid primary key default gen_random_uuid(),
  electrical_point_id uuid not null references public.electrical_points(id),
  load_type_id uuid not null references public.load_types(id),
  category public.load_assignment_category not null,
  quantity numeric not null default 1,
  watts_override numeric,
  label text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint load_assignments_quantity_positive check (quantity > 0),
  constraint load_assignments_watts_override_nonnegative check (
    watts_override is null or watts_override >= 0
  )
);

create table public.wire_gauge_defaults (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references public.houses(id),
  wire_gauge_awg integer not null,
  nominal_voltage public.nominal_voltage not null,
  advisory_limit_watts numeric not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint wire_gauge_defaults_house_gauge_voltage_key unique (
    house_id,
    wire_gauge_awg,
    nominal_voltage
  ),
  constraint wire_gauge_defaults_wire_gauge_positive check (wire_gauge_awg > 0),
  constraint wire_gauge_defaults_limit_positive check (advisory_limit_watts > 0)
);

create index load_types_house_id_idx on public.load_types(house_id);
create index load_assignments_electrical_point_id_idx
  on public.load_assignments(electrical_point_id);
create index load_assignments_load_type_id_idx
  on public.load_assignments(load_type_id);
create index wire_gauge_defaults_house_id_idx
  on public.wire_gauge_defaults(house_id);

create trigger set_load_types_updated_at
before update on public.load_types
for each row execute function public.set_updated_at();

create trigger set_load_assignments_updated_at
before update on public.load_assignments
for each row execute function public.set_updated_at();

create trigger set_wire_gauge_defaults_updated_at
before update on public.wire_gauge_defaults
for each row execute function public.set_updated_at();

create or replace view public.electrical_point_loads as
select
  la.id as load_assignment_id,
  ep.id as electrical_point_id,
  ep.quick_ref,
  ep.circuit_id,
  lt.id as load_type_id,
  lt.name as load_type_name,
  la.category,
  la.quantity,
  la.watts_override,
  lt.watts as catalog_watts,
  lt.volts,
  lt.amps,
  la.quantity * coalesce(la.watts_override, lt.watts, lt.volts * lt.amps)
    as effective_watts,
  (
    coalesce(la.watts_override, lt.watts, lt.volts * lt.amps) is null
  ) as has_unknown_wattage,
  la.label,
  la.notes
from public.load_assignments la
join public.electrical_points ep on ep.id = la.electrical_point_id
join public.load_types lt on lt.id = la.load_type_id
where la.archived_at is null
  and ep.archived_at is null
  and lt.archived_at is null;

create or replace view public.circuit_load_summaries as
with load_rollup as (
  select
    ep.circuit_id,
    coalesce(sum(epl.effective_watts) filter (
      where epl.category = 'permanent'
        and not epl.has_unknown_wattage
    ), 0)::numeric as permanent_known_watts,
    count(epl.load_assignment_id) filter (
      where epl.category = 'permanent'
        and epl.has_unknown_wattage
    )::integer as permanent_unknown_count,
    coalesce(sum(epl.effective_watts) filter (
      where epl.category = 'current'
        and not epl.has_unknown_wattage
    ), 0)::numeric as current_known_watts,
    count(epl.load_assignment_id) filter (
      where epl.category = 'current'
        and epl.has_unknown_wattage
    )::integer as current_unknown_count,
    coalesce(sum(epl.effective_watts) filter (
      where epl.category = 'possible'
        and not epl.has_unknown_wattage
    ), 0)::numeric as possible_known_watts,
    count(epl.load_assignment_id) filter (
      where epl.category = 'possible'
        and epl.has_unknown_wattage
    )::integer as possible_unknown_count
  from public.electrical_points ep
  left join public.electrical_point_loads epl
    on epl.electrical_point_id = ep.id
  where ep.archived_at is null
    and ep.circuit_id is not null
  group by ep.circuit_id
)
select
  c.id as circuit_id,
  c.house_id,
  c.label as circuit_label,
  c.nominal_voltage,
  c.breaker_amps,
  c.wire_gauge_awg,
  coalesce(lr.permanent_known_watts, 0) as permanent_known_watts,
  coalesce(lr.permanent_unknown_count, 0) as permanent_unknown_count,
  coalesce(lr.current_known_watts, 0) as current_known_watts,
  coalesce(lr.current_unknown_count, 0) as current_unknown_count,
  coalesce(lr.possible_known_watts, 0) as possible_known_watts,
  coalesce(lr.possible_unknown_count, 0) as possible_unknown_count,
  (
    coalesce(lr.permanent_known_watts, 0)
    + coalesce(lr.current_known_watts, 0)
    + coalesce(lr.possible_known_watts, 0)
  ) as worst_case_known_watts,
  (
    coalesce(lr.permanent_unknown_count, 0)
    + coalesce(lr.current_unknown_count, 0)
    + coalesce(lr.possible_unknown_count, 0)
  )::integer as worst_case_unknown_count,
  case
    when c.nominal_voltage <> 'unknown' and c.breaker_amps is not null
      then c.breaker_amps * (c.nominal_voltage::text)::numeric
    else null
  end as breaker_limit_watts,
  coalesce(c.wire_limit_watts_override, wgd.advisory_limit_watts)
    as wire_limit_watts,
  case
    when c.nominal_voltage <> 'unknown'
      and c.breaker_amps is not null
      and coalesce(c.wire_limit_watts_override, wgd.advisory_limit_watts) is not null
      then least(
        c.breaker_amps * (c.nominal_voltage::text)::numeric,
        coalesce(c.wire_limit_watts_override, wgd.advisory_limit_watts)
      )
    when c.nominal_voltage <> 'unknown' and c.breaker_amps is not null
      then c.breaker_amps * (c.nominal_voltage::text)::numeric
    else coalesce(c.wire_limit_watts_override, wgd.advisory_limit_watts)
  end as effective_limit_watts,
  case
    when (
      coalesce(lr.permanent_unknown_count, 0)
      + coalesce(lr.current_unknown_count, 0)
      + coalesce(lr.possible_unknown_count, 0)
    ) > 0 then 'unknown'
    when (
      case
        when c.nominal_voltage <> 'unknown'
          and c.breaker_amps is not null
          and coalesce(c.wire_limit_watts_override, wgd.advisory_limit_watts) is not null
          then least(
            c.breaker_amps * (c.nominal_voltage::text)::numeric,
            coalesce(c.wire_limit_watts_override, wgd.advisory_limit_watts)
          )
        when c.nominal_voltage <> 'unknown' and c.breaker_amps is not null
          then c.breaker_amps * (c.nominal_voltage::text)::numeric
        else coalesce(c.wire_limit_watts_override, wgd.advisory_limit_watts)
      end
    ) is null then 'unknown'
    when (
      coalesce(lr.permanent_known_watts, 0)
      + coalesce(lr.current_known_watts, 0)
      + coalesce(lr.possible_known_watts, 0)
    ) > (
      case
        when c.nominal_voltage <> 'unknown'
          and c.breaker_amps is not null
          and coalesce(c.wire_limit_watts_override, wgd.advisory_limit_watts) is not null
          then least(
            c.breaker_amps * (c.nominal_voltage::text)::numeric,
            coalesce(c.wire_limit_watts_override, wgd.advisory_limit_watts)
          )
        when c.nominal_voltage <> 'unknown' and c.breaker_amps is not null
          then c.breaker_amps * (c.nominal_voltage::text)::numeric
        else coalesce(c.wire_limit_watts_override, wgd.advisory_limit_watts)
      end
    ) then 'critical'
    when (
      coalesce(lr.permanent_known_watts, 0)
      + coalesce(lr.current_known_watts, 0)
      + coalesce(lr.possible_known_watts, 0)
    ) >= (
      case
        when c.nominal_voltage <> 'unknown'
          and c.breaker_amps is not null
          and coalesce(c.wire_limit_watts_override, wgd.advisory_limit_watts) is not null
          then least(
            c.breaker_amps * (c.nominal_voltage::text)::numeric,
            coalesce(c.wire_limit_watts_override, wgd.advisory_limit_watts)
          )
        when c.nominal_voltage <> 'unknown' and c.breaker_amps is not null
          then c.breaker_amps * (c.nominal_voltage::text)::numeric
        else coalesce(c.wire_limit_watts_override, wgd.advisory_limit_watts)
      end
    ) * 0.8 then 'warning'
    else 'ok'
  end as warning_level
from public.circuits c
left join load_rollup lr on lr.circuit_id = c.id
left join public.wire_gauge_defaults wgd
  on wgd.house_id = c.house_id
  and wgd.wire_gauge_awg = c.wire_gauge_awg
  and wgd.nominal_voltage = c.nominal_voltage
where c.archived_at is null;
