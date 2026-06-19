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
  status: "available" | "limited" | "restricted" | "unavailable" | string;
  message: string;
  restrictionsSummary?: string[];
  nextAllowedActions: string[];
};

export type TimeSlot = {
  id: string;
  serviceId: number;
  postalCode: string;
  label: string;
  mode: "delivery" | "visit";
  startTime?: string;
  endTime?: string;
  window: string;
  status?: "available" | "unavailable";
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
  required?: boolean;
  requiredAcknowledgement: boolean;
  severity: "info" | "warning" | "danger" | string;
};

export type QuoteSummary = {
  id: string;
  serviceId: number;
  postalCode: string;
  slotId: string;
  basePriceCents?: number;
  extraFeeCents?: number;
  totalPriceCents: number;
  currency: string;
  summary?: string;
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
