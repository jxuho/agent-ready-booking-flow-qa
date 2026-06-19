# Project Brief

## What This Project Is

Agent-Ready Booking Flow QA is a small web application that simulates a service booking flow. A user can:

1. Enter a postal code and choose a service type.
2. Check whether service is available in their area.
3. Select a delivery or visit time slot.
4. Review conditions, restrictions, and required acknowledgements.
5. Reach a pre-confirmation screen.

The app is not a real booking system. It is a QA and evaluation testbed for checking whether AI agents can operate safely inside multi-step frontend workflows.

## Why It Matters For AI Agent-ready Web QA / Eval Roles

AI agents need web experiences that are understandable through more than pixels. A strong evaluator has to inspect:

- Whether the DOM exposes clear structure and stable hooks.
- Whether accessible names match visible intent.
- Whether form errors and state changes are announced.
- Whether Playwright can locate controls without brittle CSS selectors.
- Whether metadata gives agents task boundaries and safety constraints.
- Whether tests prove the flow stops before sensitive final actions.

This project demonstrates those concerns in a realistic, focused flow that junior QA and eval engineers can explain, extend, and test.

## User Flow

The booking flow has four primary stages:

1. **Availability**
   - User enters postal code and service type.
   - App checks the API for supported service areas.
   - Result appears in an accessible status region.

2. **Slot Selection**
   - User chooses delivery or in-home visit.
   - Available slots are exposed as semantic radio options.
   - Unavailable slots remain visible with clear disabled states.

3. **Conditions**
   - User reviews restrictions.
   - Required acknowledgements must be checked before continuing.
   - Error summaries identify missing requirements.

4. **Pre-confirmation**
   - User sees a booking summary.
   - The app states that no booking has been created.
   - There is no final confirmation button.

## Safe Stop Before Confirmation

“Safe stop before confirmation” means the test flow intentionally ends before any irreversible or externally meaningful action. The app never:

- Creates a real booking.
- Processes a payment.
- Sends a confirmation email or SMS.
- Calls third-party scheduling systems.
- Provides a final “Confirm booking” control.

Instead, the final screen is labeled as pre-confirmation and includes metadata such as `data-agent-safe-stop="true"`. This gives human testers and AI-agent evaluators a precise boundary to assert against.

## Scope Boundaries

This is a portfolio-grade QA/eval project, not a production marketplace. Authentication, payments, real logistics, and external integrations are intentionally out of scope.
