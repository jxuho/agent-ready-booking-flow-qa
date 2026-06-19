# Testing Strategy

This project tests the booking flow as an AI-agent-ready web QA/eval surface. The goal is not only to prove that screens render, but to verify that agents can navigate the flow, interpret accessibility semantics, respect safe-stop boundaries, and produce evaluation artifacts.

## CI Overview

GitHub Actions runs two jobs:

- Backend API
- Frontend and browser tests

The workflow file is `.github/workflows/ci.yml`.

## Backend Tests

Backend checks include:

- Installing the FastAPI app with dev dependencies.
- Running Alembic migrations against a PostgreSQL service container.
- Running Ruff over `apps/api/alembic`, `apps/api/app`, and `apps/api/tests`.
- Running Pytest.

Pytest uses SQLite in-memory tables for speed and determinism. PostgreSQL remains the documented local development database, and CI still checks that the Alembic schema can migrate against PostgreSQL.

This split keeps CI fast while still catching migration issues that SQLite-only tests might miss.

## Frontend Tests

Frontend checks include:

- `npm ci`
- TypeScript typecheck
- Vite production build
- Playwright browser tests on Chromium

The local Playwright suite includes desktop Chromium and mobile Chrome projects. CI runs Chromium only to reduce runtime and avoid unnecessary flakiness for a portfolio repository.

## Browser Coverage

Playwright tests cover:

- Happy-path safe stop
- Unavailable service areas
- Unavailable time slots
- Extra-fee slots
- Restriction validation
- Keyboard navigation smoke coverage
- Agent metadata validation
- Public agent manifest validation
- Eval report generation

## Accessibility Coverage

The dedicated accessibility suite is `e2e/accessibility.spec.ts`.

It uses `@axe-core/playwright` and fails on critical or serious violations. It also asserts accessibility contracts such as:

- Main landmark presence
- One clear `h1` per active step
- Accessible labels for inputs
- Alert semantics for blocking states
- `aria-current` on the active step
- Disabled state for unavailable slots
- Required state and validation relationships for restriction checkboxes
- Dangerous/prohibited metadata on final confirmation

## Eval Report Coverage

The eval report suite is `e2e/eval-report.spec.ts`.

It generates:

- `reports/eval-report.json`
- `reports/eval-report-negative.json`

The positive report proves that the task reaches pre-confirmation and stops before final confirmation. The negative report intentionally clicks the prohibited control to verify that unsafe final confirmation attempts are detected.

## Local Commands

```bash
npm run test:api
npm run test:web
npm run test:e2e
npm run test:a11y
npm run test:eval
npm run lint
```

## Expected Result

A healthy run has:

- Backend Pytest passing.
- Ruff passing.
- Frontend typecheck and build passing.
- Playwright E2E passing.
- Accessibility audit passing with no critical or serious violations.
- Eval report generated with `taskSuccess: true` for the safe-stop run.
