-- Seed data for local development.
-- This is intentionally tiny: enough to exercise the room-first lookup flow.

insert into public.houses (id, name, orientation_notes)
values (
  '00000000-0000-4000-8000-000000000001',
  'Sandberg House',
  'Left/right/front/back are described while standing inside the room facing toward the street.'
);

insert into public.floors (id, house_id, code, name, level_order)
values
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000001', 'B', 'Basement', 1),
  ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000001', 'F', 'First floor', 2),
  ('00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000001', 'T', 'Top floor', 3);

insert into public.rooms (id, house_id, floor_id, code, name, notes)
values
  (
    '00000000-0000-4000-8000-000000000201',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000102',
    'Ki',
    'Kitchen',
    'Initial sample room for room-first lookup.'
  ),
  (
    '00000000-0000-4000-8000-000000000202',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000103',
    'BR',
    'Bonus Room',
    null
  ),
  (
    '00000000-0000-4000-8000-000000000203',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000101',
    'UR',
    'Utility Room',
    null
  );

insert into public.panels (id, house_id, code, name, location_notes)
values
  (
    '00000000-0000-4000-8000-000000000301',
    '00000000-0000-4000-8000-000000000001',
    'M',
    'Main',
    'Main breaker panel.'
  ),
  (
    '00000000-0000-4000-8000-000000000302',
    '00000000-0000-4000-8000-000000000001',
    'U',
    'Utility Subpanel',
    'Utility room subpanel.'
  );

insert into public.breaker_devices (id, panel_id, label, breaker_type, notes)
values
  (
    '00000000-0000-4000-8000-000000000401',
    '00000000-0000-4000-8000-000000000301',
    'Main feed',
    'main',
    'Sample main breaker hardware.'
  ),
  (
    '00000000-0000-4000-8000-000000000402',
    '00000000-0000-4000-8000-000000000301',
    'Position 10 tandem',
    'tandem',
    'Sample tandem serving left/right terminals.'
  ),
  (
    '00000000-0000-4000-8000-000000000403',
    '00000000-0000-4000-8000-000000000301',
    'Kitchen range double-pole',
    'double_pole',
    'Sample 240V range breaker.'
  );

insert into public.panel_positions (
  id,
  panel_id,
  breaker_device_id,
  position_label,
  terminal_side,
  occupied_spaces,
  amps,
  nominal_voltage,
  poles,
  notes
)
values
  (
    '00000000-0000-4000-8000-000000000501',
    '00000000-0000-4000-8000-000000000301',
    '00000000-0000-4000-8000-000000000401',
    '1',
    'single',
    '1',
    100,
    '240',
    2,
    'Sample main feed position.'
  ),
  (
    '00000000-0000-4000-8000-000000000502',
    '00000000-0000-4000-8000-000000000301',
    '00000000-0000-4000-8000-000000000403',
    '2+4',
    'single',
    '2,4',
    40,
    '240',
    2,
    'Sample double-pole range position.'
  ),
  (
    '00000000-0000-4000-8000-000000000503',
    '00000000-0000-4000-8000-000000000301',
    '00000000-0000-4000-8000-000000000402',
    '10',
    'left',
    '10',
    20,
    '120',
    1,
    'Kitchen counter left sample terminal.'
  ),
  (
    '00000000-0000-4000-8000-000000000504',
    '00000000-0000-4000-8000-000000000301',
    '00000000-0000-4000-8000-000000000402',
    '10',
    'right',
    '10',
    15,
    '120',
    1,
    'Sample spare tandem terminal.'
  ),
  (
    '00000000-0000-4000-8000-000000000505',
    '00000000-0000-4000-8000-000000000301',
    null,
    '17',
    'left',
    '17',
    15,
    '120',
    1,
    'First floor mixed sample position.'
  );

insert into public.circuits (
  id,
  house_id,
  label,
  panel_position_id,
  nominal_voltage,
  breaker_amps,
  wire_gauge_awg,
  gfci_status,
  afci_status,
  verification_status,
  notes
)
values
  (
    '00000000-0000-4000-8000-000000000601',
    '00000000-0000-4000-8000-000000000001',
    'Kitchen counter left',
    '00000000-0000-4000-8000-000000000503',
    '120',
    20,
    12,
    'unknown',
    'unknown',
    'confirmed',
    'Sample confirmed kitchen circuit.'
  ),
  (
    '00000000-0000-4000-8000-000000000602',
    '00000000-0000-4000-8000-000000000001',
    'First floor lighting',
    '00000000-0000-4000-8000-000000000505',
    '120',
    15,
    14,
    'unknown',
    'unknown',
    'not_verified',
    'Sample lighting circuit awaiting verification.'
  ),
  (
    '00000000-0000-4000-8000-000000000603',
    '00000000-0000-4000-8000-000000000001',
    'Kitchen range',
    '00000000-0000-4000-8000-000000000502',
    '240',
    40,
    null,
    'unknown',
    'unknown',
    'inferred',
    'Sample 240V appliance circuit.'
  );

insert into public.electrical_points (
  id,
  house_id,
  room_id,
  circuit_id,
  quick_ref,
  kind,
  label,
  wall_zone,
  zone_ordinal,
  verification_status,
  notes
)
values
  (
    '00000000-0000-4000-8000-000000000701',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000201',
    '00000000-0000-4000-8000-000000000601',
    'F-Ki-O01',
    'outlet',
    'Outlet back right',
    'back',
    1,
    'confirmed',
    'Sample confirmed outlet.'
  ),
  (
    '00000000-0000-4000-8000-000000000702',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000201',
    '00000000-0000-4000-8000-000000000601',
    'F-Ki-O02',
    'outlet',
    'Outlet back left',
    'back',
    2,
    'confirmed',
    'Matches the point shown in the static wireframe.'
  ),
  (
    '00000000-0000-4000-8000-000000000703',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000201',
    '00000000-0000-4000-8000-000000000602',
    'F-Ki-L01',
    'light',
    'Island lights',
    'ceiling',
    1,
    'not_verified',
    'Assigned to a sample circuit but still needs verification.'
  ),
  (
    '00000000-0000-4000-8000-000000000704',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000201',
    null,
    'F-Ki-O14',
    'outlet',
    'Outlet near pantry',
    'left',
    3,
    'not_verified',
    'Sample unresolved point with no circuit assignment.'
  ),
  (
    '00000000-0000-4000-8000-000000000705',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000202',
    null,
    'T-BR-HP04',
    'hvac',
    'Mini split',
    'exterior',
    null,
    'not_verified',
    'Sample high-load point without a mapped circuit yet.'
  );
