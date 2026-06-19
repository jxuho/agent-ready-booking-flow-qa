export type BookingStep =
  | "service-selection"
  | "service-area"
  | "time-slot"
  | "conditions"
  | "pre-confirmation";

export type ServiceType = "standard-install" | "repair-visit" | "equipment-delivery";

export type ServiceOption = {
  value: ServiceType;
  label: string;
  description: string;
};

export type CheckAreaInput = {
  postalCode: string;
  serviceType: ServiceType;
};

export type AreaCheckResult = CheckAreaInput & {
  available: boolean;
  city?: string;
  message: string;
};

export type TimeSlot = {
  id: string;
  label: string;
  mode: "delivery" | "visit";
  window: string;
  available: boolean;
  unavailableReason?: string;
};

export type BookingAcknowledgements = {
  simulatedOnly: boolean;
  noPayment: boolean;
  stopBeforeConfirmation: boolean;
};
