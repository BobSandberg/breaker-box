create or replace view public.room_summaries as
select
  r.id as room_id,
  r.house_id,
  f.code as floor_code,
  f.name as floor_name,
  f.level_order as floor_order,
  r.code as room_code,
  r.name as room_name,
  r.notes,
  count(ep.id)::integer as point_count,
  count(ep.id) filter (
    where ep.circuit_id is null
      or ep.verification_status <> 'confirmed'
  )::integer as unresolved_count,
  count(ep.id) filter (
    where ep.verification_status = 'confirmed'
  )::integer as confirmed_count
from public.rooms r
join public.floors f on f.id = r.floor_id
left join public.electrical_points ep
  on ep.room_id = r.id
  and ep.archived_at is null
where r.archived_at is null
  and f.archived_at is null
group by
  r.id,
  r.house_id,
  f.code,
  f.name,
  f.level_order,
  r.code,
  r.name,
  r.notes;

create or replace view public.electrical_point_lookup as
select
  ep.id as electrical_point_id,
  ep.house_id,
  f.code as floor_code,
  f.name as floor_name,
  f.level_order as floor_order,
  r.id as room_id,
  r.code as room_code,
  r.name as room_name,
  ep.quick_ref,
  ep.kind,
  ep.label,
  ep.wall_zone,
  ep.zone_ordinal,
  ep.verification_status as point_verification_status,
  ep.notes,
  c.id as circuit_id,
  c.label as circuit_label,
  c.verification_status as circuit_verification_status,
  c.nominal_voltage as circuit_nominal_voltage,
  c.breaker_amps,
  c.wire_gauge_awg,
  p.id as panel_id,
  p.code as panel_code,
  p.name as panel_name,
  pp.id as panel_position_id,
  pp.position_label,
  pp.terminal_side,
  pp.amps as panel_position_amps,
  pp.nominal_voltage as panel_position_nominal_voltage
from public.electrical_points ep
join public.rooms r on r.id = ep.room_id
join public.floors f on f.id = r.floor_id
left join public.circuits c on c.id = ep.circuit_id
left join public.panel_positions pp on pp.id = c.panel_position_id
left join public.panels p on p.id = pp.panel_id
where ep.archived_at is null
  and r.archived_at is null
  and f.archived_at is null;
