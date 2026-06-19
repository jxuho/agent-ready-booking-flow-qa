import { stepDefinitions } from "@/features/booking/constants";
import type { BookingStep } from "@/features/booking/types";
import { cn } from "@/lib/utils";

export function StepIndicator({ currentStep }: { currentStep: BookingStep }) {
  const currentIndex = stepDefinitions.findIndex((step) => step.id === currentStep);

  return (
    <nav aria-label="Booking progress" className="border-b border-border bg-white">
      <ol className="grid grid-cols-1 gap-px sm:grid-cols-5">
        {stepDefinitions.map((step, index) => {
          const isCurrent = step.id === currentStep;
          const isComplete = index < currentIndex;

          return (
            <li
              key={step.id}
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "bg-muted px-4 py-3 text-sm",
                isCurrent && "bg-white",
                isComplete && "bg-secondary"
              )}
              data-agent-step={step.id}
              data-agent-step-marker={step.id}
              data-agent-state={isCurrent ? "current" : isComplete ? "complete" : "upcoming"}
            >
              <span className="block text-xs font-medium text-muted-foreground">
                Step {index + 1}
              </span>
              <span className={cn("font-medium", isCurrent && "font-semibold text-primary")}>
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
