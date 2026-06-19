import type { BookingStep, ServiceOption } from "@/features/booking/types";

export const serviceOptions: ServiceOption[] = [
  {
    value: "standard-install",
    label: "Standard installation",
    description: "A simulated technician visit for setup and verification."
  },
  {
    value: "repair-visit",
    label: "Repair visit",
    description: "A simulated diagnostic visit with service restrictions."
  },
  {
    value: "equipment-delivery",
    label: "Equipment delivery",
    description: "A simulated delivery window without real logistics."
  }
];

export const stepDefinitions: Array<{ id: BookingStep; label: string }> = [
  { id: "service-selection", label: "Service" },
  { id: "service-area", label: "Area check" },
  { id: "time-slot", label: "Time slot" },
  { id: "conditions", label: "Conditions" },
  { id: "pre-confirmation", label: "Pre-confirmation" }
];

export function getServiceLabel(serviceType?: string) {
  return serviceOptions.find((option) => option.value === serviceType)?.label ?? "Not selected";
}
