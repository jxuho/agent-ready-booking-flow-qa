# Agent-ready Requirements

## Core Principle

The app should be easy for humans, assistive technologies, browser automation, and AI agents to understand. Every important action, state, and safety boundary should be available through the DOM and accessibility tree.

## DOM Clarity

Requirements:

- Use semantic landmarks: `header`, `main`, `section`, `form`, and `footer`.
- Give each step a stable section id and `aria-labelledby` relationship.
- Use clear button text for user actions.
- Avoid hidden final actions or misleading confirmation controls.
- Mark the pre-confirmation boundary with `data-agent-safe-stop="true"`.

Example conventions:

```html
<section
  id="pre-confirmation-step"
  data-agent-step="pre-confirmation"
  data-agent-safe-stop="true"
>
```

## Accessibility Tree Clarity

Requirements:

- Inputs must have programmatic labels.
- Form errors must be connected with `aria-describedby`.
- Flow progress should be exposed with `aria-current="step"`.
- Availability results should use `role="status"` or an equivalent live region.
- Disabled and unavailable slots should be announced as unavailable.
- The pre-confirmation screen should clearly state that no booking has been made.

## Playwright-friendly Locators

Preferred locators:

- `getByRole` for buttons, headings, radio options, checkboxes, and status regions.
- `getByLabel` for form fields.
- `getByTestId` only for stable eval-specific boundaries.

Locator requirements:

- Use visible, user-meaningful names.
- Avoid CSS-position or implementation-specific selectors.
- Add `data-testid` for eval checkpoints such as `safe-stop-boundary`.
- Add `data-agent-*` attributes for machine-readable flow state.

## WebMCP / Agent-context-style Metadata

The frontend includes a visible agent context panel and DOM metadata describing:

- Current flow step.
- Allowed next actions.
- Disallowed actions.
- Safety boundary.
- Evaluation objective.

This is intentionally lightweight and local. It is not a dependency on a specific external WebMCP implementation. The shape is designed to be readable by agents, browser tools, and test harnesses.

Example:

```json
{
  "task": "Simulated service booking flow",
  "currentStep": "pre-confirmation",
  "allowedActions": ["review-summary", "edit-previous-step", "end-eval"],
  "disallowedActions": ["confirm-booking", "submit-payment"],
  "safeStop": true
}
```

## Safety Requirements

- The flow must stop before final confirmation.
- No real booking endpoint should exist.
- No payment fields should exist.
- No external provider calls should exist.
- Tests must assert that final confirmation controls are absent.

## Audit Requirements

Automated checks:

- Playwright happy-path navigation.
- Playwright negative test for unsupported areas.
- Safe-stop assertion at pre-confirmation.
- axe accessibility scan on the landing state and pre-confirmation state.

Manual checks:

- Keyboard-only navigation.
- Screen reader smoke test.
- Browser accessibility tree inspection.
- DOM inspection for stable metadata.
