import { create } from "zustand";
import type {
  AreaCheckResult,
  BookingAcknowledgements,
  BookingStep,
  ServiceType,
  TimeSlot
} from "@/features/booking/types";

type BookingState = {
  step: BookingStep;
  serviceType?: ServiceType;
  areaCheck?: AreaCheckResult;
  selectedSlot?: TimeSlot;
  acknowledgements: BookingAcknowledgements;
  setStep: (step: BookingStep) => void;
  selectService: (serviceType: ServiceType) => void;
  setAreaCheck: (areaCheck: AreaCheckResult) => void;
  selectSlot: (slot: TimeSlot) => void;
  setAcknowledgement: (name: keyof BookingAcknowledgements, value: boolean) => void;
  resetFlow: () => void;
};

const initialAcknowledgements: BookingAcknowledgements = {
  simulatedOnly: false,
  noPayment: false,
  stopBeforeConfirmation: false
};

export const useBookingStore = create<BookingState>((set) => ({
  step: "service-selection",
  acknowledgements: initialAcknowledgements,
  setStep: (step) => set({ step }),
  selectService: (serviceType) =>
    set({
      serviceType,
      areaCheck: undefined,
      selectedSlot: undefined,
      acknowledgements: initialAcknowledgements,
      step: "service-area"
    }),
  setAreaCheck: (areaCheck) =>
    set({
      areaCheck,
      selectedSlot: undefined
    }),
  selectSlot: (slot) => set({ selectedSlot: slot }),
  setAcknowledgement: (name, value) =>
    set((state) => ({
      acknowledgements: {
        ...state.acknowledgements,
        [name]: value
      }
    })),
  resetFlow: () =>
    set({
      step: "service-selection",
      serviceType: undefined,
      areaCheck: undefined,
      selectedSlot: undefined,
      acknowledgements: initialAcknowledgements
    })
}));
