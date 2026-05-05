# InteropSync Karnataka — Detailed Technical Documentation

**Theme 2 — Two-Way Interoperability between SWS and Department Systems**
**PanIIT AI for Bharat Hackathon 2026**

---

## 1. Project Overview

InteropSync Karnataka is a **production-grade bidirectional translation and propagation layer** between Karnataka's Single Window System (SWS) and 40+ legacy department backends. It uses **UBID (Unique Business ID)** as the sole join key to maintain data consistency across all connected government systems.

### Problem Statement

Karnataka's SWS connects to 40+ legacy departmental databases built in complete isolation. The same business exists as different records in different databases, with incompatible schemas, field names, and status codes. There is no reliable join key across the State's business data, causing data drift, stale records, and regulatory ambiguity for lakhs of businesses.

### Solution

InteropSync sits **alongside** existing systems without modifying either SWS or department backends. It:
- Propagates changes bidirectionally (SWS ↔ Departments)
- Translates between incompatible schemas per department
- Detects and resolves conflicting data through fuzzy matching
- Maintains a tamper-proof cryptographic audit trail
- Handles offline rural offices via vector clocks
- Monitors department health and SLA compliance

---

## 2. Architecture

### 2.1 System Architecture

```
+-------------------+                              +------------------------+
|   SWS Portal      |                              |  Department Systems    |
|  (Unmodified)     |                              |  (Labour, KSPCB, etc.) |
+--------+----------+                              +----------+-------------+
         |                                                    |
         | REST API / Webhook                    REST API / Polling / CDC
         |                                                    |
+--------v----------------------------------------------------v-------------+
|                    InteropSync Middleware                                  |
|  +------------------+  +--------------------+  +------------------------+ |
|  | Schema Translator|  | Bidirectional Sync |  | Conflict Detector      | |
|  | (per-department  |  | Engine             |  | (fuzzy matching,       | |
|  |  field mappings) |  | (event-sourced,    |  |  severity tiers,       | |
|  |                  |  |  idempotent)       |  |  resolution queue)     | |
|  +------------------+  +--------------------+  +------------------------+ |
|  +------------------+  +--------------------+  +------------------------+ |
|  | Crypto Audit Log |  | Dead Letter Queue  |  | Health & SLA Monitor   | |
|  | (SHA-256 chain)  |  | (exponential retry)|  | (p50/p95/p99 latency) | |
|  +------------------+  +--------------------+  +------------------------+ |
+---------------------------------------------------------------------------+
```

### 2.2 Technology Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| Routing | React Router v7 |
| Backend (reference) | Python 3.12, FastAPI, SQLAlchemy |
| Conflict Detection | rapidfuzz (fuzzy string matching) |
| Database (reference) | SQLite (prototype), PostgreSQL (production) |
| Deployment | Vercel (SPA) |

### 2.3 Design Principles

1. **Non-invasive** — Sits alongside SWS and department systems; neither requires modification
2. **Bidirectional** — Changes propagate in both directions
3. **Event-sourced** — Every propagation recorded as immutable SyncEvent
4. **Idempotent** — SHA-256 hash prevents duplicate writes
5. **Conflict-aware** — Mismatches detected and queued for resolution
6. **UBID-anchored** — Unified Business Identifier is the join key across all systems

---

## 3. Core Features (7 Features)

### Feature 1: Multi-Surface Integration Engine

Each department exposes a different integration surface. InteropSync supports four transport mechanisms:

| Transport | Departments | Description |
|-----------|-------------|-------------|
| REST API | Labour, Commercial Tax | Direct HTTP calls with OAuth2 authentication |
| Webhook | KSPCB | Event-driven push notifications on state changes |
| SFTP File Drop | Factories & Boilers | Scheduled CSV/XML file exchange via secure FTP |
| Database Polling | Fire & Emergency | Periodic snapshot comparison via CDC-like detection |

Adding a new department requires only a **manifest entry** and a **schema mapping** — no code changes.

### Feature 2: Configurable Schema Translation Layer

Each department stores business data in incompatible formats. InteropSync maintains bidirectional translation maps:

| SWS Field | Labour | KSPCB | Commercial Tax | Factories | Fire Safety |
|-----------|--------|-------|----------------|-----------|-------------|
| business_name | establishment_name | unit_name | dealer_name | factory_name | building_name |
| owner_name | proprietor_name | contact_person | authorized_signatory | occupier_name | owner_occupant |
| registered_address | premises_address | plant_address | business_address | factory_address | building_address |
| application_status | registration_status | consent_status | registration_status | license_status | noc_status |

**Value translations** also handled: SWS "approved" → Labour "Registered", KSPCB "CTO Granted", Commercial Tax "Active", etc.

### Feature 3: Conflict Detection & Resolution with Policy Engine

When SWS and a department disagree on a field value, the system detects the collision and applies a configurable policy:

| Policy | Use Case | Example |
|--------|----------|---------|
| `latest-timestamp-wins` | Low-risk fields | Phone numbers, minor address corrections |
| `source-authority-wins` | Regulated fields | License status (only issuing department is authoritative) |
| `escalate-to-human` | High-risk fields | Legal entity name changes |

Conflict comparison strategies:
- **Critical fields** (status): Exact match required — mismatch blocks sync
- **Warning fields** (names, addresses): Fuzzy matching via rapidfuzz (80% threshold for names, 70% for addresses)
- **Info fields** (pincode): Exact match, low severity

### Feature 4: Tamper-Proof Cryptographic Audit Chain

Every propagation event is hashed into an **append-only cryptographic log**:
- Each event contains a SHA-256 `payload_hash` and links to the `prev_hash`
- Creates an independently verifiable chain — no single department controls the log
- No record is deletable — compliant with RTI requirements
- Queryable by UBID, department, direction, status, and time range

### Feature 5: Retry & Failure Recovery with Dead-Letter Queue

When a department system is unreachable:
1. Propagation retries with **exponential backoff** (configurable intervals)
2. After retry exhaustion (default: 5 attempts), event moves to **Dead Letter Queue**
3. Operators can **replay** or **discard** DLQ events via the admin dashboard
4. Every action is logged with full audit trail — no data is silently lost

### Feature 6: Offline-First Sync for Rural District Offices

District-level offices with intermittent connectivity:
- Queue all updates locally using embedded SQLite store
- On connectivity restore, replay and merge using **vector clocks**
- Vector clocks detect ordering conflicts without data loss or duplication
- Supports online, offline, and intermittent connectivity states

### Feature 7: Department Health Dashboard & SLA Monitoring

Live command center showing per-department metrics:
- **Propagation Latency**: p50, p95, p99 percentiles
- **Failure Rate**: Percentage of failed sync operations
- **Schema Drift Score**: Measures divergence from expected schema
- **Pending Conflicts**: Unresolved conflict count
- **DLQ Depth**: Dead letter queue backlog
- **Uptime**: Department system availability percentage
- **24h Sync Volume**: Operations processed in last 24 hours
- **SLA Breach Alerts**: Automated escalation for chronic underperformers

---

## 4. Project Structure

```
frontend/
├── index.html              # Entry point with SEO meta tags
├── package.json            # Dependencies (React 18, Vite, Recharts)
├── vite.config.ts          # Vite configuration with path aliases
├── tailwind.config.js      # Tailwind CSS v3 configuration
├── vercel.json             # Vercel SPA routing rewrites
├── tsconfig.json           # TypeScript configuration
└── src/
    ├── main.tsx            # React entry point
    ├── App.tsx             # Root component with sidebar navigation
    ├── index.css           # Premium dark theme with glassmorphism
    ├── data/
    │   └── mock-data.ts    # Comprehensive embedded mock data
    └── pages/
        ├── SyncDashboard.tsx       # Main dashboard (Feature overview)
        ├── IntegrationEngine.tsx   # Feature 1: Multi-Surface Integration
        ├── SchemaTranslation.tsx   # Feature 2: Schema Translation Layer
        ├── ConflictResolution.tsx  # Feature 3: Conflict Detection & Policy Engine
        ├── AuditTrail.tsx          # Feature 4: Cryptographic Audit Chain
        ├── DeadLetterQueue.tsx     # Feature 5: DLQ & Retry Recovery
        ├── OfflineSync.tsx         # Feature 6: Offline-First Sync
        └── HealthDashboard.tsx     # Feature 7: Health & SLA Monitoring
```

---

## 5. Local Development

### Prerequisites
- Node.js 18+ and npm

### Installation & Running

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173/`.

### Production Build

```bash
npm run build
```

Output is generated in `dist/` — ready for Vercel deployment.

---

## 6. Deployment (Vercel)

This project is configured for **zero-configuration Vercel deployment**:

1. Push to GitHub
2. Import the repository on Vercel
3. Set the **Root Directory** to `frontend`
4. Vercel auto-detects Vite and sets:
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. The `vercel.json` handles SPA routing rewrites

---

## 7. Backend Architecture (Reference)

The reference backend (in `/backend/`) implements:

- **FastAPI** server with bidirectional sync endpoints
- **SQLAlchemy** ORM with SQLite/PostgreSQL support
- **Schema Translation Service** — per-department field mappings
- **Conflict Detection Service** — fuzzy matching via rapidfuzz
- **Sync Engine** — event-sourced, idempotent propagation

### API Endpoints (Reference)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/applications/ | Create SWS application |
| GET | /api/applications/ | List applications |
| POST | /api/sync/sws-to-dept | Trigger SWS → Department sync |
| POST | /api/sync/dept-to-sws | Trigger Department → SWS sync |
| GET | /api/sync/events | Query audit trail |
| GET | /api/conflicts/ | List detected conflicts |
| PUT | /api/conflicts/{id}/resolve | Resolve a conflict |
| GET | /api/conflicts/stats | Conflict statistics |

---

## 8. Data Model

### SWS Application
Fields: id, ubid, sws_reference_no, business_name, owner_name, registered_address, pincode, business_type, sector, service_type, application_status, pan, gstin

### Department Record
Fields: id, department_name, dept_record_id, ubid, establishment_name, proprietor_name, premises_address, pin_code, entity_type, registration_number, registration_status

### Sync Event (Audit Trail)
Fields: id, direction, status, ubid, event_type, payload, payload_hash, source_schema, translated_schema, conflict_id, attempt_count

### Conflict Record
Fields: id, ubid, field_name, sws_value, dept_value, department_name, resolution, resolved_value, severity

---

## 9. Key References

- [Karnataka Single Window System Portal](https://swskrn.karnataka.gov.in/)
- [National e-Governance Plan — MeitY](https://www.meity.gov.in/divisions/national-e-governance-plan)
- [IndEA (India Enterprise Architecture) Framework](https://www.meity.gov.in/writereaddata/files/IndEA_Framework_1.0.pdf)
- [Splink — Probabilistic Record Linkage](https://github.com/moj-analytical-services/splink)
- [DIGIT Platform — eGov Foundation](https://egov.org.in)

---

*All data used is synthetic — no real PII or government data is included.*
