# Agent-Ready Booking Flow QA

A portfolio project for a Junior AI Agent-ready Web QA / Eval Engineer role.

This repository contains a small service-booking testbed designed to evaluate whether AI agents can navigate frontend web flows safely, accurately, and efficiently. The app lets a user select a service, check area availability, choose a delivery or visit time slot, review restrictions, and reach a pre-confirmation screen. The normal evaluation goal is to stop before final confirmation.

## Why This Project Exists

Modern web QA increasingly includes AI agents that read pages through the DOM, accessibility tree, browser automation APIs, and agent-context metadata. This project treats those surfaces as first-class product requirements rather than afterthoughts.

The goal is to demonstrate:

- Agent-ready frontend UI design
- Clear DOM structure and stable Playwright locators
- Accessible labels, landmarks, statuses, and summaries
- Explicit metadata for agent context and task boundaries
- End-to-end tests that verify safe navigation
- Accessibility audits with axe
- A safe stop before any real booking, payment, or final confirmation

## Monorepo Layout

```text
apps/
  api/                 FastAPI service with SQLAlchemy 2.x models and Pydantic schemas
  web/                 React + TypeScript + Vite frontend with agent-ready UI
docs/                  Project brief, agent-ready requirements, and eval plan
e2e/                   Playwright and axe-based browser tests
docker-compose.yml     Local web, API, and PostgreSQL services
```

## Tech Stack

### Frontend

- React and TypeScript for a typed component model
- Vite for a lightweight dev workflow
- Tailwind CSS for utility-first styling
- shadcn/ui-inspired primitives for accessible, consistent UI controls
- Zustand for local booking-flow state
- TanStack React Query for API state
- React Hook Form and Zod for typed validation
- Playwright and `@axe-core/playwright` for E2E and accessibility evals

### Backend

- FastAPI for a clear, typed API surface
- PostgreSQL for realistic persistence
- SQLAlchemy 2.x for ORM models
- Alembic for database migrations
- Pydantic v2 for API validation
- Pytest for backend tests

### Infrastructure

- Docker Compose for local orchestration

## Prerequisites

- Node.js 20+
- npm 10+
- Python 3.10+
- Docker and Docker Compose

This repo uses npm workspaces. No pnpm workspace is required.

## Local Setup

```bash
npm install
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -e apps/api[dev]
cp .env.example .env
```

Optional app-specific env examples are also available:

- `apps/api/.env.example`
- `apps/web/.env.example`

## Start PostgreSQL

For local development with a local backend process:

```bash
docker compose up -d db
```

This starts PostgreSQL on `localhost:5432` using the values in `.env` or the defaults from `docker-compose.yml`.

## Run The Backend

With the virtual environment active:

```bash
python3 -m uvicorn app.main:app --reload --app-dir apps/api
```

Equivalent root script:

```bash
npm run dev:api
```

The API runs at `http://localhost:8000`.

## Run The Frontend

```bash
npm run dev:web
```

The web app runs at `http://localhost:5173`.

## Run The Full Stack With Docker Compose

```bash
docker compose up --build
```

This starts PostgreSQL, the FastAPI backend, and the Vite frontend.

Default URLs:

- Web app: `http://localhost:5173`
- API: `http://localhost:8000`
- API docs: `http://localhost:8000/docs`

## Testing

Frontend E2E and accessibility checks:

```bash
npm run test:e2e
```

Playwright starts the Vite frontend on `http://localhost:5174` for E2E runs. The suite covers the happy-path safe stop, unavailable areas, unavailable slots, extra-fee quote behavior, restrictions validation, keyboard navigation smoke coverage, agent context JSON, the public agent manifest, and axe accessibility smoke checks.

Useful E2E variants:

```bash
npm run test:e2e:headed
npm run test:e2e:ui
npm run test:e2e:report
```

On failure, Playwright keeps traces, screenshots, and videos under the usual Playwright output folders so the failed frontend state can be inspected.

Backend tests:

```bash
npm run test:api
```

Frontend typecheck/build:

```bash
npm run test:web
```

Backend and frontend checks together:

```bash
npm test
```

Lint/typecheck:

```bash
npm run lint
npm run typecheck
```

## API Surface

The backend exposes only simulated booking-flow endpoints:

- `GET /health`
- `GET /api/services`
- `POST /api/availability/check`
- `GET /api/slots?service_id=&postal_code=`
- `GET /api/restrictions?service_id=&postal_code=`
- `POST /api/quote`
- `POST /api/confirm-attempt`

There is no endpoint that completes a real booking. `/api/quote` creates a pre-confirmation draft with `confirmAllowed: false` and `safeStopRequired: true`. `/api/confirm-attempt` is an evaluation/safety endpoint: it records or reports that a prohibited final-confirmation action was attempted, returns `blocked: true`, and does not create a booking.

## Safe Stop Before Confirmation

The flow ends at a pre-confirmation screen. It shows the user what would happen next, but it does not create a real booking, collect payment, or trigger notifications.

The UI may display a final confirmation control on the pre-confirmation screen, but it is explicitly marked as prohibited for AI-agent evaluation with attributes such as `data-agent-prohibited="true"` and `data-agent-dangerous-action="true"`. The safe-stop boundary is marked with `data-agent-safe-stop="true"` so an evaluator can verify that an AI agent stops at the correct point.

See [docs/project-brief.md](docs/project-brief.md), [docs/agent-ready-requirements.md](docs/agent-ready-requirements.md), and [docs/eval-plan.md](docs/eval-plan.md) for the role-focused rationale.
