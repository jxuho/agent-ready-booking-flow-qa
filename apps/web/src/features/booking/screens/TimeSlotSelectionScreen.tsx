import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RadioGroup, RadioOption } from "@/components/ui/radio-group";
import { formatCurrency } from "@/features/booking/constants";
import { useBookingStore } from "@/features/booking/booking-store";
import { fetchTimeSlots } from "@/lib/api";

export function TimeSlotSelectionScreen() {
  const { availability, selectedService, selectedSlot, selectSlot, setStep } = useBookingStore();
  const postalCode = availability?.postalCode ?? "";

  const slotsQuery = useQuery({
    queryKey: ["time-slots", postalCode, selectedService?.id],
    queryFn: () =>
      fetchTimeSlots({
        postalCode,
        serviceId: selectedService?.id ?? 0
      }),
    enabled: Boolean(availability?.available && selectedService)
  });

  return (
    <section
      id="time-slot-step"
      aria-labelledby="time-slot-heading"
      data-agent-step="time-slot"
      data-agent-state="current"
      data-agent-risk="medium"
    >
      <Card>
        <CardHeader>
          <p className="text-sm font-medium text-muted-foreground">Step 3 of 5</p>
          <h1 id="time-slot-heading" className="text-2xl font-semibold">
            Select a delivery or visit time slot
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Available slots are selectable radio controls. Fully booked slots remain visible but
            disabled for accessibility and eval clarity.
          </p>
        </CardHeader>
        <CardContent>
          {slotsQuery.isLoading && (
            <Alert role="status">
              <Loader2 aria-hidden="true" className="mr-2 inline h-4 w-4 animate-spin" />
              Loading simulated time slots.
            </Alert>
          )}

          {slotsQuery.isError && (
            <Alert variant="danger" role="alert">
              Time slots could not be loaded. Return to area check or try again.
            </Alert>
          )}

          {slotsQuery.data && slotsQuery.data.length > 0 && (
            <RadioGroup legend="Available service time slots" className="mt-1">
              {slotsQuery.data.map((slot) => {
                const detailsId = `${slot.id}-details`;
                const feeBadgeId = `${slot.id}-fee`;
                const unavailableId = `${slot.id}-unavailable`;
                const describedBy = [
                  detailsId,
                  slot.extraFeeCents > 0 ? feeBadgeId : null,
                  !slot.available ? unavailableId : null
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <RadioOption
                    key={slot.id}
                    name="slot"
                    value={slot.id}
                    label={slot.label}
                    descriptionId={detailsId}
                    description={`Mode: ${slot.mode}. Window: ${slot.window}. ${
                      slot.extraFeeCents > 0
                        ? `Extra fee: ${formatCurrency(slot.extraFeeCents)}.`
                        : "No extra fee."
                    } ${
                      slot.available ? "" : `Unavailable: ${slot.unavailableReason ?? "Not selectable"}.`
                    }`}
                    disabled={!slot.available}
                    checked={selectedSlot?.id === slot.id}
                    aria-checked={selectedSlot?.id === slot.id}
                    aria-describedby={describedBy}
                    onChange={() => {
                      if (slot.available) {
                        selectSlot(slot);
                      }
                    }}
                    data-agent-slot-id={slot.id}
                    data-agent-state={
                      !slot.available
                        ? "unavailable"
                        : selectedSlot?.id === slot.id
                          ? "selected"
                          : "available"
                    }
                    data-agent-slot-available={String(slot.available)}
                    data-agent-slot-selected={String(selectedSlot?.id === slot.id)}
                    data-agent-extra-fee-cents={slot.extraFeeCents}
                    data-agent-risk={slot.extraFeeCents > 0 ? "medium" : "low"}
                    className="shadow-panel"
                  >
                    {slot.extraFeeCents > 0 && (
                      <Badge id={feeBadgeId} variant="warning" className="mt-2">
                        Extra fee {formatCurrency(slot.extraFeeCents)}
                      </Badge>
                    )}
                    {!slot.available && (
                      <span id={unavailableId} className="mt-2 block text-sm font-medium text-destructive">
                        Unavailable: {slot.unavailableReason ?? "Not selectable"}
                      </span>
                    )}
                  </RadioOption>
                );
              })}
            </RadioGroup>
          )}

          {slotsQuery.data?.length === 0 && (
            <Alert role="status">
              No simulated slots are available for this service area. Return to area check and try
              another postal code.
            </Alert>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={() => setStep("service-area")}
              data-agent-action="back-to-service-area-check"
            >
              Back to service area check
            </Button>
            <Button
              disabled={!selectedSlot}
              onClick={() => setStep("conditions")}
              data-agent-action="continue-to-conditions"
            >
              Continue to conditions and restrictions
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
