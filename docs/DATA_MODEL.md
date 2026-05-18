# Breaker Circuit Mapping App Data Model

## Overview

The data model separates physical electrical infrastructure from logical circuit mapping and from user-facing lookup information.

Core distinction:

```text
Panel → Panel Position / Breaker Hardware → Circuit → Electrical Point → Load Assignment
                                      ↘ Verification Events ↙
Floor → Room ─────────────────────────→ Electrical Point
```

Do not collapse these into one string field. That is how the spreadsheet lost consistency.

## Entity Summary

| Entity | Purpose |
|---|---|
| `houses` | Top-level scope for all data. V1 uses one house. |
| `floors` | Floor definitions and ordering. |
| `rooms` | Rooms/areas where electrical points exist. |
| `panels` | Breaker boxes/subpanels. |
| `panel_positions` | Physical positions/spaces/terminals in a panel. |
| `breaker_devices` | Optional physical breaker hardware records. |
| `circuits` | Logical circuits served by breaker terminals. |
| `electrical_points` | Outlets, lights, switches, appliance feeds, HVAC points, etc. |
| `switch_controls` | Switch-to-controlled-point relationships. |
| `load_types` | Reusable device/load catalog. |
| `load_assignments` | Loads attached to electrical points. |
| `wire_gauge_defaults` | Editable advisory defaults for gauge-derived capacity. |
| `verification_events` | Evidence/history for confirmed, contradicted, partial, or uncertain mappings. |
| `quick_ref_history` | Rename history for visible quick-ref codes. |
| `attachments` | Photos/documents linked to records. |

## Enums

Suggested enums. Names can be adjusted during implementation.

### `electrical_point_kind`

- `outlet`
- `light`
- `switch`
- `appliance_feed`
- `hvac`
- `panel`
- `junction`
- `other`

### `wall_zone`

- `front`
- `back`
- `left`
- `right`
- `ceiling`
- `floor`
- `exterior`
- `unknown`
- `not_applicable`

For this house, left/right/front/back use the convention: standing inside the room facing toward the street.

### `verification_status`

Used as current rollup/status on points and circuits.

- `not_verified`
- `confirmed`
- `contradicted`
- `partial`
- `uncertain`
- `inferred`

### `verification_method`

- `breaker_off_test`
- `tester`
- `continuity`
- `electrician`
- `inferred`
- `other`

### `verification_result`

- `confirmed`
- `contradicted`
- `partial`
- `uncertain`

### `load_assignment_category`

- `permanent_installed`
- `currently_plugged_in`
- `possible_portable`

### `breaker_type`

- `standard`
- `tandem`
- `double_pole`
- `gfci`
- `afci`
- `main`
- `unknown`
- `other`

### `nominal_voltage`

Could be enum or numeric.

- `120`
- `240`
- `unknown`

### `terminal_side`

- `left`
- `right`
- `top`
- `bottom`
- `single`
- `unknown`

## Tables

## `houses`

Top-level scope.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | Internal immutable ID. |
| `name` | text | Required. |
| `orientation_notes` | text | Defines house-specific orientation convention. |
| `created_at` | timestamptz | Required. |
| `updated_at` | timestamptz | Required. |
| `archived_at` | timestamptz nullable | Soft archive. |

V1 likely has one row.

## `floors`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | Internal ID. |
| `house_id` | uuid FK | `houses.id`. |
| `code` | text | Required. Example: `B`, `F`, `T`, `A`. |
| `name` | text | Required. Example: `Basement`. |
| `level_order` | integer | Sort order. |
| `created_at` | timestamptz | Required. |
| `updated_at` | timestamptz | Required. |
| `archived_at` | timestamptz nullable | Soft archive. |

Constraints:

- unique `(house_id, code)`
- unique `(house_id, level_order)` if desired

## `rooms`

Room codes are globally unique within a house.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | Internal ID. |
| `house_id` | uuid FK | `houses.id`. Denormalized for constraints/querying. |
| `floor_id` | uuid FK | `floors.id`. |
| `code` | text | Required, globally unique in house. Example: `Ki`, `GB`, `MB`. |
| `name` | text | Required. Display name may be repeated in principle, but code cannot. |
| `notes` | text nullable | Optional. |
| `created_at` | timestamptz | Required. |
| `updated_at` | timestamptz | Required. |
| `archived_at` | timestamptz nullable | Soft archive. |

Constraints:

- unique `(house_id, code)`
- foreign key `floor_id → floors.id`

## `panels`

Breaker boxes/subpanels.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | Internal ID. |
| `house_id` | uuid FK | `houses.id`. |
| `code` | text | Required. Example: `M`, `U`. |
| `name` | text | Required. Example: `Main`, `Utility Subpanel`. |
| `location_notes` | text nullable | Optional. |
| `created_at` | timestamptz | Required. |
| `updated_at` | timestamptz | Required. |
| `archived_at` | timestamptz nullable | Soft archive. |

Constraints:

- unique `(house_id, code)`
- unique `(house_id, name)` optional

## `breaker_devices`

Represents physical breaker hardware. This is separate from circuits.

A tandem breaker may serve two circuits from one occupied panel position. A double-pole breaker may occupy multiple positions and serve a 240V circuit.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | Internal ID. |
| `panel_id` | uuid FK | `panels.id`. |
| `label` | text | Human label, optional but useful. |
| `breaker_type` | enum | `standard`, `tandem`, `double_pole`, etc. |
| `manufacturer` | text nullable | Optional. |
| `model` | text nullable | Optional. |
| `notes` | text nullable | Optional. |
| `created_at` | timestamptz | Required. |
| `updated_at` | timestamptz | Required. |
| `archived_at` | timestamptz nullable | Soft archive. |

## `panel_positions`

A physical or logical position/terminal in a panel that can be assigned to a circuit.

Examples:

- Main panel, position 17, left terminal
- Main panel, position 17, right terminal
- Main panel, positions 2+4 for a double-pole breaker

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | Internal ID. |
| `panel_id` | uuid FK | `panels.id`. |
| `breaker_device_id` | uuid FK nullable | Optional link to physical breaker hardware. |
| `position_label` | text | Required. Example: `17`, `2+4`, `10`. |
| `terminal_side` | enum | Required. `left`, `right`, `single`, etc. |
| `occupied_spaces` | text nullable | Optional text for multi-space hardware, e.g. `2,4`. |
| `amps` | numeric nullable | Amp rating for this terminal/circuit. |
| `nominal_voltage` | enum/numeric | `120`, `240`, `unknown`. |
| `poles` | integer nullable | Optional. |
| `notes` | text nullable | Optional. |
| `created_at` | timestamptz | Required. |
| `updated_at` | timestamptz | Required. |
| `archived_at` | timestamptz nullable | Soft archive. |

Constraints:

- unique `(panel_id, position_label, terminal_side)`
- `amps > 0` when not null

Open implementation choice:

- `occupied_spaces` can start as text for simplicity.
- If later needed, normalize to `breaker_device_positions` join table.

## `circuits`

Logical electrical circuits.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | Internal ID. |
| `house_id` | uuid FK | `houses.id`. |
| `label` | text | Required, unique in house. Example: `Kitchen counter left`. |
| `panel_position_id` | uuid FK nullable | `panel_positions.id`; nullable while unresolved. |
| `nominal_voltage` | enum/numeric | Required, default `unknown`. |
| `breaker_amps` | numeric nullable | Can be copied/inferred from panel position but overrideable. |
| `wire_gauge_awg` | integer nullable | Example: `14`, `12`, `10`. Unknown allowed. |
| `wire_limit_watts_override` | numeric nullable | Optional circuit-specific advisory override. |
| `gfci_status` | text/enum nullable | Could be `yes/no/unknown`. |
| `afci_status` | text/enum nullable | Could be `yes/no/unknown`. |
| `verification_status` | enum | Required, default `not_verified`. |
| `notes` | text nullable | Optional. |
| `created_at` | timestamptz | Required. |
| `updated_at` | timestamptz | Required. |
| `archived_at` | timestamptz nullable | Soft archive. |

Constraints:

- unique `(house_id, label)`
- `breaker_amps > 0` when not null
- `wire_gauge_awg > 0` when not null

Notes:

- `panel_position_id` is nullable so a circuit can exist before the exact panel assignment is known.
- If multiple panel positions ever need to feed one circuit, add a join table. Do not force that complexity into v1 unless encountered.

## `electrical_points`

User-facing electrical items: outlets, lights, switches, appliance feeds, HVAC points, etc.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | Internal immutable ID. |
| `house_id` | uuid FK | `houses.id`. |
| `room_id` | uuid FK | `rooms.id`. |
| `circuit_id` | uuid FK nullable | `circuits.id`; nullable while unresolved. |
| `quick_ref` | text | Required, unique in house. Example: `F-Ki-O02`. |
| `kind` | enum | Required. |
| `label` | text | Required. Example: `Outlet back left`. |
| `wall_zone` | enum | Optional/default `unknown`. |
| `zone_ordinal` | integer nullable | Order within wall/zone. |
| `verification_status` | enum | Required, default `not_verified`. |
| `notes` | text nullable | Optional. |
| `created_at` | timestamptz | Required. |
| `updated_at` | timestamptz | Required. |
| `archived_at` | timestamptz nullable | Soft archive. |

Constraints:

- unique `(house_id, quick_ref)`
- `zone_ordinal > 0` when not null
- foreign key `room_id → rooms.id`
- foreign key `circuit_id → circuits.id`

V1 required fields:

- room
- kind
- quick-ref
- label
- verification status, default `not_verified`

## `quick_ref_history`

Tracks quick-ref renames.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | Internal ID. |
| `electrical_point_id` | uuid FK | `electrical_points.id`. |
| `old_quick_ref` | text | Required. |
| `new_quick_ref` | text | Required. |
| `changed_by` | uuid/text nullable | Auth user or display name. |
| `changed_at` | timestamptz | Required. |
| `notes` | text nullable | Optional. |

Constraint:

- `old_quick_ref <> new_quick_ref`

## `switch_controls`

Models switches controlling lights, fans, switched outlets, or other points.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | Internal ID. |
| `switch_point_id` | uuid FK | Must reference an electrical point of kind `switch`. |
| `controlled_point_id` | uuid FK | Electrical point controlled by the switch. |
| `control_type` | text nullable | Example: `single_pole`, `three_way`, `four_way`, `unknown`. |
| `notes` | text nullable | Optional. |
| `created_at` | timestamptz | Required. |
| `updated_at` | timestamptz | Required. |
| `archived_at` | timestamptz nullable | Soft archive. |

Constraints:

- unique `(switch_point_id, controlled_point_id)`
- prevent `switch_point_id = controlled_point_id`

Implementation note:

- Enforcing `switch_point_id.kind = switch` requires either an application check or a database trigger. Application check is acceptable for v1, database trigger is sturdier.

## `load_types`

Reusable load catalog.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | Internal ID. |
| `house_id` | uuid FK nullable | Nullable if global catalog later; house-scoped for v1 is fine. |
| `name` | text | Required. Example: `Microwave`. |
| `watts` | numeric nullable | Unknown allowed. |
| `volts` | numeric nullable | Optional. |
| `amps` | numeric nullable | Optional. |
| `horsepower` | numeric nullable | Optional. |
| `description` | text nullable | Optional. |
| `created_at` | timestamptz | Required. |
| `updated_at` | timestamptz | Required. |
| `archived_at` | timestamptz nullable | Soft archive. |

Constraints:

- unique `(house_id, name)` for v1
- `watts >= 0` when not null
- `volts > 0` when not null
- `amps >= 0` when not null

Calculation:

- If `watts` is null and both `volts` and `amps` exist, the app may calculate/display `volts * amps`.
- Store calculated watts explicitly or use a generated column/view. Generated is cleaner if Supabase/Postgres setup allows it.

## `load_assignments`

Loads attached to electrical points.

V1 does not support circuit-level placeholder loads.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | Internal ID. |
| `electrical_point_id` | uuid FK | `electrical_points.id`. |
| `load_type_id` | uuid FK | `load_types.id`. |
| `category` | enum | permanent/current/possible. |
| `quantity` | numeric | Required, default `1`. |
| `watts_override` | numeric nullable | Optional if this instance differs from catalog. |
| `label` | text nullable | Optional instance label. |
| `notes` | text nullable | Optional. |
| `created_at` | timestamptz | Required. |
| `updated_at` | timestamptz | Required. |
| `archived_at` | timestamptz nullable | Soft archive. |

Constraints:

- `quantity > 0`
- `watts_override >= 0` when not null

Effective watts:

```text
effective_watts = quantity * coalesce(watts_override, load_types.watts)
```

If both `watts_override` and `load_types.watts` are null, the assignment has unknown wattage.

## `wire_gauge_defaults`

Editable reference table for advisory capacity.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | Internal ID. |
| `house_id` | uuid FK | `houses.id`. |
| `wire_gauge_awg` | integer | Required. Example: `14`, `12`, `10`. |
| `nominal_voltage` | enum/numeric | Required. |
| `advisory_limit_watts` | numeric | Required. |
| `notes` | text nullable | Optional. |
| `created_at` | timestamptz | Required. |
| `updated_at` | timestamptz | Required. |

Constraints:

- unique `(house_id, wire_gauge_awg, nominal_voltage)`
- `advisory_limit_watts > 0`

Circuit-specific rule:

```text
wire_limit_watts = coalesce(circuits.wire_limit_watts_override, matching wire_gauge_defaults.advisory_limit_watts)
```

If gauge is unknown or no matching default exists, wire-derived limit is unknown.

## `verification_events`

Historical evidence records.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | Internal ID. |
| `house_id` | uuid FK | `houses.id`. |
| `electrical_point_id` | uuid FK nullable | Point verified, if point-level. |
| `circuit_id` | uuid FK nullable | Circuit verified or inferred from point. |
| `panel_position_id` | uuid FK nullable | Snapshot/inferred breaker position at time of verification. |
| `verified_at` | timestamptz | Required, default now. |
| `verified_by` | text | Required or defaulted from user preference. |
| `method` | enum | Required. |
| `result` | enum | Required. Quick verify defaults to `confirmed`. |
| `notes` | text nullable | Optional. |
| `created_at` | timestamptz | Required. |

Constraints:

- at least one of `electrical_point_id` or `circuit_id` must be present

Behavior:

- Creating a `confirmed` verification event may update current `verification_status` on the point/circuit.
- `contradicted`, `partial`, and `uncertain` should be visible and should not be overwritten silently.
- Historical event should retain the circuit/panel position known at the time of verification.

## `attachments`

Photos/documents linked to records.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | Internal ID. |
| `house_id` | uuid FK | `houses.id`. |
| `storage_path` | text | Required. Supabase storage path. |
| `caption` | text nullable | Optional. |
| `record_type` | text | Example: `panel`, `electrical_point`, `verification_event`. |
| `record_id` | uuid | Target record ID. |
| `created_at` | timestamptz | Required. |
| `archived_at` | timestamptz nullable | Soft archive. |

Implementation note:

- Polymorphic `record_type` / `record_id` is flexible but not fully FK-enforced.
- If stronger enforcement is desired, use specific join tables like `panel_attachments`, `point_attachments`, etc.
- For v1, polymorphic is acceptable if application validation is careful.

## Derived Views

These should likely be implemented as SQL views or application queries.

## `circuit_load_summary`

For each circuit:

- installed/fixed known watts
- installed/fixed unknown count
- current plugged-in known watts
- current plugged-in unknown count
- possible portable known watts
- possible portable unknown count
- worst-case known watts
- worst-case unknown count
- breaker advisory limit watts
- wire advisory limit watts
- effective advisory limit watts
- warning level

Suggested effective limit:

```text
effective_limit = least_non_null(breaker_limit_watts, wire_limit_watts)
```

Where:

```text
breaker_limit_watts = nominal_voltage * breaker_amps
wire_limit_watts = circuit override or wire gauge default
```

If voltage or amps are unknown, breaker limit is unknown.

Warning level:

- `unknown`: limit unknown or wattage incomplete
- `ok`: total under 80%
- `warning`: total >= 80% and <= 100%
- `critical`: total > 100%

Important: unknown wattages must make totals explicitly incomplete. Do not treat unknown as zero without showing incomplete status.

## `electrical_point_lookup`

For room browser and detail screens:

- floor code/name
- room code/name
- quick-ref
- kind
- label
- wall/zone
- circuit label
- panel code/name
- panel position label
- terminal side
- verification status
- unresolved flags

## Constraints and Guardrails

Minimum recommended database constraints:

- unique electrical point quick-ref per house
- unique floor code per house
- unique room code per house
- unique panel code per house
- unique panel position + terminal per panel
- unique circuit label per house
- unique load type name per house
- positive numeric checks for amps, volts, watts, quantities
- soft archive timestamps rather than destructive cascade deletes

Application-level guardrails:

- prevent attaching loads directly to circuits in v1
- warn when electrical point has no circuit
- warn when circuit has unknown wire gauge
- warn when load has unknown wattage
- warn when a switch controls nothing
- warn when a circuit has no panel position
- prevent public signup / data access by unapproved users

## Soft Delete / Archive Policy

Default behavior should be archive, not hard delete.

Tables with `archived_at` should be hidden by default but recoverable.

Hard delete can be reserved for admin/debug operations.

## Auth and Row-Level Security

V1 auth model:

- single allowed account
- all records scoped to one house

RLS options:

1. Add `owner_user_id` to `houses`, and allow access to records connected to houses owned by `auth.uid()`.
2. Add a `house_members` table even for one user, making future household sharing easier.

Recommended:

```text
house_members(user_id, house_id, role)
```

Even for one user, this avoids rewriting access control later.

Roles for later:

- `owner`
- `editor`
- `viewer`

V1 can only use `owner`.

## Suggested `house_members` Table

| Column | Type | Notes |
|---|---|---|
| `house_id` | uuid FK | `houses.id`. |
| `user_id` | uuid | Supabase auth user ID. |
| `role` | text | `owner` for v1. |
| `created_at` | timestamptz | Required. |

Constraints:

- primary key `(house_id, user_id)`

## Open Schema Questions

- Should `attachments` use polymorphic links or explicit join tables?
- Should `load_types.watts` be stored directly, generated from volts/amps, or both?
- Should `panel_positions.occupied_spaces` stay as text for v1 or be normalized immediately?
- Should circuit `breaker_amps` be copied from panel position or always derived?
- Should verification event creation automatically update current status, or require explicit user confirmation?

## Initial Seed Ideas

### Floors

Based on the spreadsheet:

| Code | Name | Order |
|---|---|---:|
| `G` | Ground/Outside | 0 |
| `B` | Basement | 1 |
| `F` | First floor | 2 |
| `T` | Top floor | 3 |
| `A` | Attic | 4 |

### Panels

| Code | Name |
|---|---|
| `M` | Main |
| `U` | Utility Subpanel |

### Common load types

Seed only if useful. Manual clean entry may be better.

Examples:

- LED Lamp
- Light Switch
- Microwave
- Dishwasher
- Oven
- Stovetop
- Heat Pump Mini Split
- Garage Door Opener
- Computer Small
- Computer Large
- Toto Toilet Seat
