# InteropSync Karnataka

**Self-Healing Semantic Middleware for Government Interoperability**

---

## Theme

**Theme 2 — Two-Way Interoperability between SWS and Department Systems**
PanIIT AI for Bharat Hackathon 2026

## Problem

Karnataka's Single Window System (SWS) connects to 40+ legacy departmental databases built in complete isolation. There is no reliable join key across the State's business data. The same business exists as different records in different databases, and master data cannot be linked. Activity data — inspections, renewals, compliance events — sits inside each department system and cannot be aggregated per business.

## Solution

InteropSync Karnataka is a **production-grade bidirectional translation and propagation layer** between SWS and all connected department backends. It uses **UBID (Unique Business ID)** as the sole join key. When a business updates its data in SWS, InteropSync translates that change into the target department's schema and pushes it via the appropriate integration surface. When a department issues a new license or inspection result, InteropSync captures and propagates it back to SWS. Every operation is **idempotent** — replaying the same event produces the same result.

## Core Features

1. **Multi-Surface Integration Engine** — Supports REST API, Webhook, SFTP, and Database Polling. Auto-selects transport per department.
2. **Configurable Schema Translation** — Per-department bidirectional field mapping. Version-controlled translation maps.
3. **Conflict Detection & Policy Engine** — Fuzzy matching with severity tiers. Policies: latest-timestamp-wins, source-authority-wins, escalate-to-human.
4. **Tamper-Proof Cryptographic Audit Chain** — SHA-256 append-only log. Independently verifiable by any department or auditor.
5. **Dead Letter Queue & Retry Recovery** — Exponential backoff with configurable retry. Manual replay/discard with full audit.
6. **Offline-First Sync** — Vector clock-based merge for rural district offices with intermittent connectivity.
7. **Health Dashboard & SLA Monitoring** — p50/p95/p99 latency, failure rates, schema drift, automated SLA breach alerts.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Recharts
- **Backend (reference)**: Python, FastAPI, SQLAlchemy, rapidfuzz
- **Deployment**: Vercel (SPA)

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

## Who Benefits

- **40+ Karnataka departments** — Single source of truth with zero manual re-entry
- **10,000+ businesses** — Approvals clear in hours instead of weeks
- **District offices** — Full participation despite poor rural connectivity
- **CAG and audit bodies** — Tamper-proof, independently verifiable audit trail
- **Citizens filing RTI** — Timestamped, hash-verified government action logs

---

*All data used is synthetic — no real PII or government data is included.*
