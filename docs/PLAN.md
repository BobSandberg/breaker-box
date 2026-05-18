# Breaker Circuit Mapping App Plan

## Purpose

Build a centralized web app for mapping the house electrical system.

The app should answer two primary questions:

1. When standing at an outlet, light, switch, appliance feed, or HVAC point: **which circuit/breaker controls this?**
2. Given known and possible loads: **is this circuit approaching or exceeding safe advisory capacity?**

The app is advisory only. It must never imply that work is safe without physical verification that the line is de-energized.

## Product Principles

- The database is the source of truth, not the spreadsheet.
- Relationships must be enforced by the database, not trusted to manual consistency.
- Electrical safety information must expose uncertainty rather than hide it.
- The first version should be useful while walking around the house with a phone.
- V1 should avoid over-generalizing beyond this house.

## V1 Scope

### Included

- Responsive web app / PWA usable on phone and desktop.
- Public login with a single allowed account.
- Central hosted database.
- Manual clean data entry from scratch.
- Guided forms with validation and pick-lists.
- Room-first browsing.
- Panel and circuit management.
- Electrical point management.
- Load catalog and load assignment.
- Circuit load summaries.
- What-if load calculator.
- Verification workflow.
- Optional notes and photos.
- Light history:
  - created timestamp
  - updated timestamp
  - archived timestamp
  - verification history
  - quick-ref rename history

### Excluded from V1

- Spreadsheet import.
- Repeated sync from the spreadsheet.
- Native iPhone app.
- Offline editing/sync.
- Full audit log for every field change.
- Full NEC/code-compliance calculation engine.
- Measured real-time circuit loads.
- Room photo marker maps.
- Floor-plan editor.
- Bulk/grid editing, except possibly later.

## Architecture

### Frontend

- **Next.js** responsive web app.
- PWA-friendly layout.
- Mobile-first forms and lookup flows.
- Hosted on **Vercel**.

### Backend

- **Supabase**:
  - Postgres database
  - Auth
  - Storage for photos/documents

### Auth

- Single allowed account.
- No public signup.
- App data scoped to one house initially, but schema should allow multiple houses later without much pain.

## Setup Flow

Recommended guided setup order:

1. House basics
2. Floors
3. Rooms
4. Panels / breaker boxes
5. Panel positions and breaker hardware
6. Circuits
7. Electrical points
8. Load catalog
9. Load assignments
10. Verification events

This order keeps upstream reference records available before downstream records depend on them.

## Core User Workflows

### 1. Find the breaker for an electrical point

User path:

1. Open room browser.
2. Select floor.
3. Select room.
4. Select electrical point.
5. View:
   - quick-ref code
   - label
   - circuit
   - panel position / breaker information
   - verification status
   - latest verification event
   - notes/photos

Safety language should remain visible: verify de-energized before working.

### 2. Enter a room's electrical points

User path:

1. Select room.
2. Add point.
3. Required fields:
   - room
   - kind
   - unique quick-ref code
   - short label
   - verification status, default `not_verified`
4. Optional fields:
   - wall/zone
   - ordinal/order
   - notes
   - circuit assignment
   - photo

Electrical points may exist without a known circuit. They should be marked unresolved until assigned and verified.

### 3. Map circuits to panel positions

User path:

1. Open panel view.
2. Create/select panel position.
3. Define breaker hardware details.
4. Attach one or more circuits as appropriate.

The app must support tandem breakers and multi-space breakers. A plain string like `M17` is not enough.

### 4. Verify a mapping

User path:

1. Open electrical point or circuit.
2. Tap quick verify.
3. App defaults:
   - verifier = last used verifier
   - result = `confirmed`
   - date/time = now
4. User selects method and adds notes if needed.

Verification records should infer affected circuit/breaker from current relationships, while preserving the historical values recorded at verification time.

### 5. Review circuit load

User path:

1. Open circuit detail.
2. View served electrical points.
3. View load summaries:
   - installed/fixed total
   - current plugged-in total
   - possible portable total
   - worst-case total
   - breaker headroom
   - wire-gauge-derived headroom when known
4. Unknown wattages must make totals visibly incomplete.

### 6. What-if load calculation

User path:

1. Open circuit or electrical point.
2. Select or enter a proposed load.
3. App shows projected totals and advisory warnings.

Warnings:

- over 80% of breaker or known wire limit: warning
- over 100%: critical
- unknown wire gauge or unknown wattage: incomplete-confidence warning

## V1 Screens

### Dashboard

Shows:

- unresolved electrical points
- circuits with unknown wire gauge
- loads with unknown wattage
- warnings/critical load summaries
- recently verified mappings

### Room Browser

Hierarchy:

```text
Floor → Room → Electrical Points
```

Each point row should show:

- quick-ref
- kind
- label
- circuit label if assigned
- verification status
- warning badge if unresolved

### Electrical Point Detail

Shows/edit:

- quick-ref
- kind
- room
- wall/zone
- ordinal/order
- label
- notes
- circuit assignment
- attached loads
- verification history
- photos

### Circuit Detail

Shows/edit:

- circuit label
- panel/breaker assignment
- voltage
- breaker amps
- wire gauge
- GFCI/AFCI status
- served points
- load summaries
- what-if calculator
- verification status/history

### Panel View

Shows:

- panel positions
- occupied spaces
- terminals/sides
- breaker type
- amp rating
- circuit assignments

V1 can be a structured list/table. A visual panel diagram can come later.

### Load Catalog

Shows/edit reusable load types:

- name
- watts
- optional volts
- optional amps
- category defaults
- notes

### Verification Workflow

Supports:

- quick confirm
- contradicted result
- partial result
- uncertain result
- method selection
- notes
- optional photo

## Naming and Orientation

### Quick-ref codes

Quick-ref codes are visible and unique. They are not internal database IDs.

Examples from the spreadsheet:

```text
F-Ki-O02
T-BR-L01
B-UR-HP02
```

Rules:

- required for electrical points
- unique within the house
- editable
- changes recorded in quick-ref rename history

### Room codes

Room codes are globally unique within the house.

Room display names may be human-friendly but should not be relied on as unique identity.

### Orientation convention

For this house, left/right/front/back are defined from the viewpoint of standing inside the room facing toward the street.

This convention is house-specific and may need revision if the app is generalized later.

## Safety and Trust Model

The app should distinguish:

- not verified
- confirmed
- contradicted
- partial
- uncertain
- inferred

No screen should present circuit mapping as permission to work on wiring. The app should always preserve the advisory boundary.

## Open Risks

- The house-specific orientation convention may fail for unusual rooms.
- Unknown wire gauge and unknown wattage will produce incomplete summaries.
- What-if calculation increases v1 scope but directly supports the core goal.
- Optional photos are useful but can distract from the core relational model.
- V1 will depend on hosted services remaining available.

## Recommended Implementation Phases

### Phase 1: Project foundation

- Create Next.js app.
- Connect Supabase.
- Configure auth for single allowed account.
- Add base layout/navigation.

### Phase 2: Database schema

- Create tables, enums, constraints, and indexes.
- Add RLS policies scoped to the allowed user/house.
- Add seed data for common floors, rooms, panels, and load types as desired.

### Phase 3: Setup and core CRUD

- House/floor/room CRUD.
- Panel and panel-position CRUD.
- Circuit CRUD.
- Electrical point CRUD.

### Phase 4: Load model

- Load catalog CRUD.
- Attach loads to electrical points.
- Circuit load summaries.
- Unknown wattage handling.

### Phase 5: Verification

- Quick verify workflow.
- Verification history.
- Default verifier memory.
- Status rollups.

### Phase 6: Usability pass

- Dashboard warnings.
- Mobile polish.
- What-if calculator.
- Optional photo upload.

## Review Questions

- Should photos be implemented in v1 or only schema-ready?
- Should what-if calculation ship before or after verification workflow?
- Should panel view be a structured list only, or should v1 include a simple visual layout?
- What initial load catalog entries should be seeded?
