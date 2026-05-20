create or replace view public.circuit_summaries as
select
  c.id as circuit_id,
  c.house_id,
  c.label as circuit_label,
  c.verification_status,
  c.nominal_voltage,
  c.breaker_amps,
  c.wire_gauge_awg,
  c.gfci_status,
  c.afci_status,
  c.notes,
  p.id as panel_id,
  p.code as panel_code,
  p.name as panel_name,
  pp.id as panel_position_id,
  pp.position_label,
  pp.terminal_side,
  pp.amps as panel_position_amps,
  pp.nominal_voltage as panel_position_nominal_voltage,
  count(ep.id)::integer as point_count,
  count(ep.id) filter (
    where ep.verification_status <> 'confirmed'
  )::integer as unresolved_point_count
from public.circuits c
left join public.panel_positions pp on pp.id = c.panel_position_id
left join public.panels p on p.id = pp.panel_id
left join public.electrical_points ep
  on ep.circuit_id = c.id
  and ep.archived_at is null
where c.archived_at is null
group by
  c.id,
  c.house_id,
  c.label,
  c.verification_status,
  c.nominal_voltage,
  c.breaker_amps,
  c.wire_gauge_awg,
  c.gfci_status,
  c.afci_status,
  c.notes,
  p.id,
  p.code,
  p.name,
  pp.id,
  pp.position_label,
  pp.terminal_side,
  pp.amps,
  pp.nominal_voltage;

create or replace view public.panel_position_lookup as
select
  pp.id as panel_position_id,
  p.id as panel_id,
  p.house_id,
  p.code as panel_code,
  p.name as panel_name,
  p.location_notes,
  pp.position_label,
  pp.terminal_side,
  pp.occupied_spaces,
  pp.amps,
  pp.nominal_voltage,
  pp.poles,
  pp.notes,
  bd.id as breaker_device_id,
  bd.label as breaker_device_label,
  bd.breaker_type,
  c.id as circuit_id,
  c.label as circuit_label,
  c.verification_status as circuit_verification_status,
  c.breaker_amps,
  c.wire_gauge_awg,
  count(ep.id)::integer as served_point_count
from public.panel_positions pp
join public.panels p on p.id = pp.panel_id
left join public.breaker_devices bd on bd.id = pp.breaker_device_id
left join public.circuits c
  on c.panel_position_id = pp.id
  and c.archived_at is null
left join public.electrical_points ep
  on ep.circuit_id = c.id
  and ep.archived_at is null
where pp.archived_at is null
  and p.archived_at is null
group by
  pp.id,
  p.id,
  p.house_id,
  p.code,
  p.name,
  p.location_notes,
  pp.position_label,
  pp.terminal_side,
  pp.occupied_spaces,
  pp.amps,
  pp.nominal_voltage,
  pp.poles,
  pp.notes,
  bd.id,
  bd.label,
  bd.breaker_type,
  c.id,
  c.label,
  c.verification_status,
  c.breaker_amps,
  c.wire_gauge_awg;
