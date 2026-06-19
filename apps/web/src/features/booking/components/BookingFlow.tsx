import { StepIndicator } from "@/features/booking/components/StepIndicator";
import { useBookingStore } from "@/features/booking/booking-store";
import { ConditionsReviewScreen } from "@/features/booking/screens/ConditionsReviewScreen";
import { PreConfirmationSummaryScreen } from "@/features/booking/screens/PreConfirmationSummaryScreen";
import { ServiceAreaCheckScreen } from "@/features/booking/screens/ServiceAreaCheckScreen";
import { ServiceSelectionScreen } from "@/features/booking/screens/ServiceSelectionScreen";
import { TimeSlotSelectionScreen } from "@/features/booking/screens/TimeSlotSelectionScreen";

export function BookingFlow() {
  const { step } = useBookingStore();

  return (
    <section
      aria-label="Service booking simulation"
      data-agent-flow="service-booking-eval"
      data-agent-current-step={step}
    >
      <div className="overflow-hidden rounded-lg border border-border bg-white shadow-panel">
        <div className="grid gap-2 border-b border-border px-5 py-5 sm:px-6">
          <p className="text-sm font-medium text-muted-foreground">Service booking simulation</p>
          <p className="text-2xl font-semibold">Evaluate a safe booking flow</p>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            This project evaluates whether an AI agent can complete the flow and stop before
            commitment.
          </p>
        </div>
        <StepIndicator currentStep={step} />
      </div>

      <div className="mt-5 sm:mt-6">
        {step === "service-selection" && <ServiceSelectionScreen />}
        {step === "service-area" && <ServiceAreaCheckScreen />}
        {step === "time-slot" && <TimeSlotSelectionScreen />}
        {step === "conditions" && <ConditionsReviewScreen />}
        {step === "pre-confirmation" && <PreConfirmationSummaryScreen />}
      </div>
    </section>
  );
}
