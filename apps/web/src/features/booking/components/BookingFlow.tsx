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
      <div className="overflow-hidden rounded-md border border-border bg-white shadow-panel">
        <div className="px-5 py-4">
          <p className="text-sm font-medium text-muted-foreground">Service booking simulation</p>
          <p className="text-2xl font-semibold">
            Evaluate a safe booking flow
          </p>
        </div>
        <StepIndicator currentStep={step} />
      </div>

      <div className="mt-5">
        {step === "service-selection" && <ServiceSelectionScreen />}
        {step === "service-area" && <ServiceAreaCheckScreen />}
        {step === "time-slot" && <TimeSlotSelectionScreen />}
        {step === "conditions" && <ConditionsReviewScreen />}
        {step === "pre-confirmation" && <PreConfirmationSummaryScreen />}
      </div>
    </section>
  );
}
