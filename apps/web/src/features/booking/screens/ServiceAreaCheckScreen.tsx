import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getServiceLabel } from "@/features/booking/constants";
import { areaCheckSchema, type AreaCheckFormData } from "@/features/booking/schemas";
import { useBookingStore } from "@/features/booking/booking-store";
import { checkAvailability } from "@/lib/api";

export function ServiceAreaCheckScreen() {
  const { availability, selectedService, setAvailability, setStep } = useBookingStore();
  const form = useForm<AreaCheckFormData>({
    resolver: zodResolver(areaCheckSchema),
    defaultValues: {
      postalCode: availability?.postalCode ?? ""
    }
  });

  const areaMutation = useMutation({
    mutationFn: (values: AreaCheckFormData) =>
      checkAvailability({
        postalCode: values.postalCode,
        serviceId: selectedService?.id ?? 0
      }),
    onSuccess: (result) => {
      setAvailability(result);
    }
  });

  function handleSubmit(values: AreaCheckFormData) {
    areaMutation.mutate(values);
  }

  return (
    <section
      id="service-area-step"
      aria-labelledby="service-area-heading"
      data-agent-step="service-area"
      data-agent-state="current"
      data-agent-risk={availability?.available === false ? "medium" : "low"}
    >
      <Card>
        <CardHeader>
          <p className="text-sm font-medium text-muted-foreground">Step 2 of 5</p>
          <h1 id="service-area-heading" className="text-2xl font-semibold">
            Check service availability in your area
          </h1>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4"
            onSubmit={form.handleSubmit(handleSubmit)}
            aria-describedby="area-check-help"
          >
            <p id="area-check-help" className="text-sm text-muted-foreground">
              Selected service: {getServiceLabel(selectedService)}. Supported test postal codes
              include 10001, 11201, 60601, and 94105. Postal code 99999 is unavailable.
            </p>

            <div className="grid gap-2">
              <label htmlFor="postalCode" className="text-sm font-medium">
                Postal code
              </label>
              <Input
                id="postalCode"
                inputMode="numeric"
                data-agent-field="postal-code"
                data-agent-required="true"
                required
                aria-required="true"
                aria-invalid={Boolean(form.formState.errors.postalCode)}
                aria-describedby={
                  form.formState.errors.postalCode ? "postal-code-error" : "area-check-help"
                }
                {...form.register("postalCode")}
              />
              {form.formState.errors.postalCode && (
                <p id="postal-code-error" className="text-sm text-destructive">
                  {form.formState.errors.postalCode.message}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={areaMutation.isPending}>
                {areaMutation.isPending && (
                  <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />
                )}
                Check service area availability
              </Button>
              <Button
                variant="secondary"
                onClick={() => setStep("service-selection")}
                data-agent-action="back-to-service-selection"
              >
                Back to service selection
              </Button>
            </div>
          </form>

          {areaMutation.isError && (
            <Alert className="mt-5" variant="danger" role="alert">
              Availability could not be checked. Verify the API is running or try again.
            </Alert>
          )}

          {availability && (
            <Alert
              className="mt-5"
              variant={
                availability.available
                  ? availability.partiallyRestricted
                    ? "warning"
                    : "success"
                  : "danger"
              }
              role={availability.available ? "status" : "alert"}
              data-testid="availability-status"
              data-agent-availability={
                availability.available
                  ? availability.partiallyRestricted
                    ? "restricted"
                    : "supported"
                  : "unsupported"
              }
              data-agent-state={
                availability.available
                  ? availability.partiallyRestricted
                    ? "partially-available"
                    : "available"
                  : "unavailable"
              }
            >
              <div className="flex gap-2">
                {availability.available ? (
                  <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 text-accent" />
                ) : (
                  <AlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 text-destructive" />
                )}
                <div>
                  <p className="font-medium">{availability.message}</p>
                  <p className="text-muted-foreground">
                    Postal code: {availability.postalCode}
                    {availability.city ? ` · Area: ${availability.city}` : ""}
                    {availability.partiallyRestricted ? " · Restrictions apply" : ""}
                  </p>
                </div>
              </div>
            </Alert>
          )}

          <div className="mt-5">
            <Button
              disabled={!availability?.available}
              onClick={() => setStep("time-slot")}
              data-agent-action="continue-to-time-slots"
            >
              Continue to time slot selection
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
