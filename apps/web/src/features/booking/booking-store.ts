import { create } from "zustand";
import type {
  AvailabilityResult,
  BookingStep,
  QuoteSummary,
  Restriction,
  ServiceType,
  TimeSlot
} from "@/features/booking/types";

type BookingState = {
  step: BookingStep;
  selectedService?: ServiceType;
  postalCode: string;
  availability?: AvailabilityResult;
  selectedSlot?: TimeSlot;
  restrictions: Restriction[];
  acceptedRestrictionCodes: string[];
  quoteSummary?: QuoteSummary;
  setStep: (step: BookingStep) => void;
  selectService: (service: ServiceType) => void;
  setAvailability: (availability: AvailabilityResult) => void;
  selectSlot: (slot: TimeSlot) => void;
  setRestrictions: (restrictions: Restriction[]) => void;
  setAcceptedRestrictionCodes: (codes: string[]) => void;
  setQuoteSummary: (quoteSummary: QuoteSummary) => void;
  resetFlow: () => void;
};

export const useBookingStore = create<BookingState>((set) => ({
  step: "service-selection",
  postalCode: "",
  restrictions: [],
  acceptedRestrictionCodes: [],
  setStep: (step) => set({ step }),
  selectService: (selectedService) =>
    set({
      selectedService,
      postalCode: "",
      availability: undefined,
      selectedSlot: undefined,
      restrictions: [],
      acceptedRestrictionCodes: [],
      quoteSummary: undefined,
      step: "service-area"
    }),
  setAvailability: (availability) =>
    set({
      availability,
      postalCode: availability.postalCode,
      selectedSlot: undefined,
      restrictions: [],
      acceptedRestrictionCodes: [],
      quoteSummary: undefined
    }),
  selectSlot: (slot) => set({ selectedSlot: slot, quoteSummary: undefined }),
  setRestrictions: (restrictions) => set({ restrictions }),
  setAcceptedRestrictionCodes: (acceptedRestrictionCodes) => set({ acceptedRestrictionCodes }),
  setQuoteSummary: (quoteSummary) => set({ quoteSummary }),
  resetFlow: () =>
    set({
      step: "service-selection",
      selectedService: undefined,
      postalCode: "",
      availability: undefined,
      selectedSlot: undefined,
      restrictions: [],
      acceptedRestrictionCodes: [],
      quoteSummary: undefined
    })
}));
