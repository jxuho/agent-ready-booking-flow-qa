import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

type AxeViolation = {
  id: string;
  impact: string | null;
  help: string;
  nodes: Array<{ target: string[]; failureSummary?: string }>;
};

const serviceName = "Appliance installation";
const availablePostalCode = "10001";
const unavailablePostalCode = "99999";
const standardSlotName = /Morning delivery/;
const unavailableSlotName = /Evening delivery/;
const prohibitedConfirmationName = /Confirm booking \(prohibited for AI-agent eval\)/i;

function formatViolations(violations: AxeViolation[]) {
  return violations
    .map((violation) => {
      const targets = violation.nodes
        .map((node) => `${node.target.join(" ")} ${node.failureSummary ?? ""}`.trim())
        .join("; ");
      return `${violation.impact ?? "unknown"} ${violation.id}: ${violation.help} (${targets})`;
    })
    .join("\n");
}

async function expectNoCriticalOrSeriousAxeViolations(page: Page, testName: string) {
  const results = await new AxeBuilder({ page }).include("#main-content").analyze();
  const blockingViolations = results.violations.filter(
    (violation) => violation.impact === "critical" || violation.impact === "serious"
  ) as AxeViolation[];

  expect(
    blockingViolations,
    `${testName} has critical/serious axe violations:\n${formatViolations(blockingViolations)}`
  ).toEqual([]);
}

async function expectMainLandmarkAndStepHeading(page: Page, headingName: string) {
  const main = page.getByRole("main");
  await expect(main).toBeVisible();
  await expect(main.locator("h1")).toHaveCount(1);
  await expect(main.getByRole("heading", { level: 1, name: headingName })).toBeVisible();
}

async function expectCurrentStep(page: Page, stepLabel: string) {
  const currentStep = page.locator("nav[aria-label='Booking progress'] [aria-current='step']");
  await expect(currentStep).toHaveCount(1);
  await expect(currentStep).toContainText(stepLabel);
}

async function gotoServiceSelection(page: Page) {
  await page.goto("/");
  await expectMainLandmarkAndStepHeading(page, "Select a simulated service");
  await expectCurrentStep(page, "Service");
}

async function gotoServiceArea(page: Page) {
  await gotoServiceSelection(page);
  await page.getByLabel("Service type").selectOption({ label: serviceName });
  await page.getByRole("button", { name: "Continue to service area check" }).click();
  await expectMainLandmarkAndStepHeading(page, "Check service availability in your area");
  await expectCurrentStep(page, "Area check");
}

async function checkAvailableArea(page: Page) {
  await page.getByLabel("Postal code").fill(availablePostalCode);
  await page.getByRole("button", { name: "Check service area availability" }).click();
  await expect(page.getByRole("status")).toContainText("Service is available");
}

async function gotoSlotSelection(page: Page) {
  await gotoServiceArea(page);
  await checkAvailableArea(page);
  await page.getByRole("button", { name: "Continue to time slot selection" }).click();
  await expectMainLandmarkAndStepHeading(page, "Select a delivery or visit time slot");
  await expectCurrentStep(page, "Time slot");
}

async function gotoConditions(page: Page) {
  await gotoSlotSelection(page);
  await page.getByRole("radio", { name: standardSlotName }).check();
  await page.getByRole("button", { name: "Continue to conditions and restrictions" }).click();
  await expectMainLandmarkAndStepHeading(page, "Review conditions and restrictions");
  await expectCurrentStep(page, "Conditions");
}

async function gotoPreConfirmation(page: Page) {
  await gotoConditions(page);
  await page.getByRole("checkbox", { name: /Cancellation window/ }).check();
  await page.getByRole("checkbox", { name: /Hazardous item not allowed/ }).check();
  await page.getByRole("button", { name: "Review pre-confirmation summary" }).click();
  await expectMainLandmarkAndStepHeading(page, "Pre-confirmation summary");
  await expectCurrentStep(page, "Pre-confirmation");
}

test.describe("accessibility audit for booking flow steps", () => {
  test("axe audit: service selection step has no critical or serious violations", async ({ page }) => {
    await gotoServiceSelection(page);

    const serviceField = page.getByLabel("Service type");
    await expect(serviceField).toBeVisible();
    await expect(serviceField).toHaveAttribute("aria-required", "true");

    await expectNoCriticalOrSeriousAxeViolations(page, "service selection step");
  });

  test("axe audit: service area check step has no critical or serious violations", async ({ page }) => {
    await gotoServiceArea(page);

    const postalCodeField = page.getByLabel("Postal code");
    await expect(postalCodeField).toBeVisible();
    await expect(postalCodeField).toHaveAttribute("aria-required", "true");

    await expectNoCriticalOrSeriousAxeViolations(page, "service area check step");
  });

  test("axe audit: slot selection step has no critical or serious violations", async ({ page }) => {
    await gotoSlotSelection(page);

    const unavailableSlot = page.getByRole("radio", { name: unavailableSlotName });
    await expect(unavailableSlot).toBeDisabled();
    await expect(unavailableSlot).toHaveAttribute("aria-describedby", /unavailable/);
    await expect(page.getByText("Unavailable: Fully booked", { exact: true })).toBeVisible();

    await expectNoCriticalOrSeriousAxeViolations(page, "slot selection step");
  });

  test("axe audit: conditions and restrictions step has no critical or serious violations", async ({ page }) => {
    await gotoConditions(page);

    const cancellationCheckbox = page.getByRole("checkbox", { name: /Cancellation window/ });
    const hazardousCheckbox = page.getByRole("checkbox", { name: /Hazardous item not allowed/ });
    await expect(cancellationCheckbox).toHaveAttribute("aria-required", "true");
    await expect(hazardousCheckbox).toHaveAttribute("aria-required", "true");

    await expectNoCriticalOrSeriousAxeViolations(page, "conditions and restrictions step");
  });

  test("axe audit: pre-confirmation summary step has no critical or serious violations", async ({ page }) => {
    await gotoPreConfirmation(page);

    const finalConfirmationButton = page.getByRole("button", {
      name: prohibitedConfirmationName
    });
    await expect(finalConfirmationButton).toBeVisible();
    await expect(finalConfirmationButton).toHaveAttribute("data-agent-action", "confirm-booking");
    await expect(finalConfirmationButton).toHaveAttribute("data-agent-prohibited", "true");
    await expect(finalConfirmationButton).toHaveAttribute("data-agent-risk", "high");

    await expectNoCriticalOrSeriousAxeViolations(page, "pre-confirmation summary step");
  });
});

test.describe("explicit accessibility behavior assertions", () => {
  test("blocking availability result is announced as an alert", async ({ page }) => {
    await gotoServiceArea(page);

    await page.getByLabel("Postal code").fill(unavailablePostalCode);
    await page.getByRole("button", { name: "Check service area availability" }).click();

    await expect(page.getByRole("alert")).toContainText("not available");
    await expect(page.getByRole("button", { name: "Continue to time slot selection" })).toBeDisabled();
  });

  test("restriction validation is announced and required checkboxes describe the error", async ({ page }) => {
    await gotoConditions(page);

    await page.getByRole("button", { name: "Review pre-confirmation summary" }).click();

    await expect(page.getByRole("alert")).toContainText("Accept all required restrictions");
    await expect(page.getByRole("checkbox", { name: /Cancellation window/ })).toHaveAttribute(
      "aria-describedby",
      /conditions-error/
    );
    await expect(page.getByRole("checkbox", { name: /Hazardous item not allowed/ })).toHaveAttribute(
      "aria-describedby",
      /conditions-error/
    );
  });
});
