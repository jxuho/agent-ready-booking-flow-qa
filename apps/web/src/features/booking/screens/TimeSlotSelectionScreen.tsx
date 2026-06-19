import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RadioGroup, RadioOption } from "@/components/ui/radio-group";
import { useBookingStore } from "@/features/booking/booking-store";
import { listTimeSlots } from "@/lib/api";

export function TimeSlotSelectionScreen() {
  const { areaCheck, selectedSlot, selectSlot, serviceType, setStep } = useBookingStore();
  const postalCode = areaCheck?.postalCode ?? "";

  const slotsQuery = useQuery({
    queryKey: ["time-slots", postalCode, serviceType],
    queryFn: () =>
      listTimeSlots({
        postalCode,
        serviceType: serviceType ?? "standard-install"
      }),
    enabled: Boolean(areaCheck?.available && serviceType)
  });

  return (
    <section id="time-slot-step" aria-labelledby="time-slot-heading" data-agent-step="time-slot">
      <Card>
        <CardHeader>
          <p className="text-sm font-medium text-muted-foreground">Step 3 of 5</p>
          <h2 id="time-slot-heading" className="text-2xl font-semibold">
            Select a delivery or visit time slot
          </h2>
        </CardHeader>
        <CardContent>
          {slotsQuery.isLoading && (
            <Alert role="status">
              <Loader2 aria-hidden="true" className="mr-2 inline h-4 w-4 animate-spin" />
              Loading simulated time slots.
            </Alert>
          )}

          {slotsQuery.data && (
            <RadioGroup legend="Available service time slots" className="mt-1">
              {slotsQuery.data.map((slot) => (
                <RadioOption
                  key={slot.id}
                  name="slot"
                  value={slot.id}
                  label={slot.label}
                  description={`Mode: ${slot.mode}. Window: ${slot.window}.${
                    slot.available ? "" : ` Unavailable: ${slot.unavailableReason}.`
                  }`}
                  disabled={!slot.available}
                  checked={selectedSlot?.id === slot.id}
                  onChange={() => {
                    if (slot.available) {
                      selectSlot(slot);
                    }
                  }}
                  data-agent-slot-id={slot.id}
                  data-agent-slot-available={String(slot.available)}
                />
              ))}
            </RadioGroup>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => setStep("service-area")}>
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
