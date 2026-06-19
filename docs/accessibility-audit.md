# Accessibility Audit

## Why Accessibility Matters For AI Agents

AI agents do not only inspect pixels. Browser agents, Playwright MCP-style tools, and eval harnesses often reason through the DOM, accessibility tree, roles, names, states, and relationships between controls. A booking flow that is clear to assistive technologies is usually clearer to an AI agent as well.

This project treats accessibility as part of agent readiness. Labels, landmarks, headings, alerts, disabled states, selected states, and safe-stop messaging are all testable contracts.

## Accessibility Tree Quality And Agent Navigation

High-quality accessibility trees help agents:

- Find the active step by heading instead of visual layout.
- Select form fields by accessible label.
- Choose slots by radio role and accessible name.
- Detect unavailable options through native disabled state.
- Understand blocking validation through `role="alert"` and `aria-describedby`.
- Identify current progress through `aria-current="step"`.
- Stop safely when the final confirmation action is marked as prohibited.

Poor accessibility tree quality forces agents to rely on fragile CSS selectors, coordinates, visual guesses, or hidden implementation details. That increases the risk of wrong clicks, skipped restrictions, and unsafe final-confirmation attempts.

## What The Audit Checks

The dedicated audit file is `e2e/accessibility.spec.ts`.

Automated axe scans run on the app main content for:

- Service selection step
- Service area check step
- Slot selection step
- Conditions and restrictions step
- Pre-confirmation summary step

The axe scans fail on `critical` and `serious` violations. Violations are not suppressed in this suite. If a failure appears, the preferred fix is to improve the UI semantics or styling rather than weakening the audit.

Explicit assertions also verify:

- The `main` landmark exists.
- Each active step exposes exactly one clear `h1`.
- Inputs are reachable by accessible labels.
- Blocking availability results use `role="alert"`.
- Validation errors are announced through `role="alert"`.
- The current step uses `aria-current="step"`.
- Disabled or fully booked time slots are native disabled radio controls and describe why they are unavailable.
- Required restriction checkboxes expose required state and validation relationships.
- The final confirmation button has a clear accessible name and is marked with dangerous/prohibited agent metadata.

## How To Run The Audit

Install dependencies first:

```bash
npm install
npx playwright install
```

Run only the accessibility audit:

```bash
npm run test:a11y
```

Run the full browser test suite, including accessibility coverage:

```bash
npm run test:e2e
```

Playwright starts the Vite frontend on `http://localhost:5174` during these runs. On failure, traces, screenshots, and videos are retained by the Playwright configuration.

## Current Expected Results

Current expected result:

```text
e2e/accessibility.spec.ts passes on chromium and mobile-chrome.
No critical or serious axe violations are expected on any booking step.
```

The broader E2E suite also checks happy-path safe stop, unavailable areas, unavailable slots, extra-fee quote behavior, restrictions validation, keyboard navigation, public agent manifest JSON, and live agent context JSON.
