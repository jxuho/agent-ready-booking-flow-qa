import type { BookingStep, ServiceType } from "@/features/booking/types";

export const stepDefinitions: Array<{ id: BookingStep; label: string }> = [
  { id: "service-selection", label: "Service" },
  { id: "service-area", label: "Area check" },
  { id: "time-slot", label: "Time slot" },
  { id: "conditions", label: "Conditions" },
  { id: "pre-confirmation", label: "Pre-confirmation" }
];

export function getServiceLabel(service?: ServiceType) {
  return service?.name ?? "Not selected";
}

export function formatCurrency(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  }).format(cents / 100);
}
