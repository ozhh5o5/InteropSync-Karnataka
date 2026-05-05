# InteropSync Karnataka — SWS-Department Interoperability Middleware

**Self-Healing Semantic Middleware for Two-Way Interoperability between Karnataka's Single Window System (SWS) and 40+ Department Systems**

> **PanIIT AI for Bharat Hackathon 2026** — Theme 2: Two-Way Interoperability between SWS and Department Systems

## Overview

InteropSync Karnataka is a production-grade bidirectional translation and propagation layer between SWS and department backends. It uses UBID (Unique Business ID) as the join key to maintain data consistency across Labour, KSPCB, Commercial Tax, Factories & Boilers, and Fire & Emergency Services departments.

## Core Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | Multi-Surface Integration Engine | REST API, Webhook, SFTP, Database Polling — auto-selected per department |
| 2 | Schema Translation Layer | Per-department bidirectional field and value mapping |
| 3 | Conflict Detection & Policy Engine | Fuzzy matching with severity tiers and configurable resolution policies |
| 4 | Cryptographic Audit Chain | SHA-256 append-only hash chain — tamper-proof, independently verifiable |
| 5 | Dead Letter Queue | Exponential backoff retry with manual replay/discard |
| 6 | Offline-First Sync | Vector clock-based merge for rural district offices |
| 7 | Health & SLA Monitoring | p50/p95/p99 latency, failure rates, SLA breach alerts |

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173/` in your browser.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Recharts
- **Backend (reference):** Python, FastAPI, SQLAlchemy, rapidfuzz
- **Deployment:** Vercel (SPA)

## Documentation

- [Detailed Documentation](./DOCUMENTATION.md)
- [Short Description](./SHORT_DESCRIPTION.md)
- [Solution Document](./docs/solution-document.md)

## Deployment

This project deploys to Vercel as a Vite SPA:

1. Push to GitHub
2. Import on Vercel
3. Set Root Directory to `frontend`
4. Vercel auto-detects Vite and deploys

---

*All data used is synthetic — no real PII or government data is included.*
