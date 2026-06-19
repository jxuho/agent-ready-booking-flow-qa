export type BookingStep =
  | "service-selection"
  | "service-area"
  | "time-slot"
  | "conditions"
  | "pre-confirmation";

export type ServiceType = {
  id: number;
  slug: string;
  name: string;
  description: string;
  basePriceCents: number;
  active: boolean;
};

export type CheckAreaInput = {
  serviceId: number;
  postalCode: string;
};

export type AvailabilityResult = CheckAreaInput & {
  city: string | null;
  available: boolean;
  partiallyRestricted: boolean;
  status: "available" | "restricted" | "unavailable" | string;
  message: string;
  nextAllowedActions: string[];
};

export type TimeSlot = {
  id: string;
  serviceId: number;
  postalCode: string;
  label: string;
  mode: "delivery" | "visit";
  window: string;
  available: boolean;
  fullyBooked: boolean;
  extraFeeCents: number;
  unavailableReason: string | null;
};

export type Restriction = {
  id: number;
  code: string;
  label: string;
  description: string;
  requiredAcknowledgement: boolean;
  severity: "info" | "warning" | "danger" | string;
};

export type QuoteSummary = {
  id: string;
  serviceId: number;
  postalCode: string;
  slotId: string;
  totalPriceCents: number;
  currency: string;
  safeStopRequired: boolean;
  confirmAllowed: boolean;
  safetyNotice: string;
  missingAcknowledgements: string[];
};

export type ConfirmAttemptResult = {
  id: string;
  quoteId: string | null;
  attemptedAction: string;
  blocked: boolean;
  message: string;
  createdAt: string | null;
};
