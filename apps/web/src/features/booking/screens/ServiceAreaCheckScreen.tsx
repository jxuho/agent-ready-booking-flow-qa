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
import { checkServiceArea } from "@/lib/api";

export function ServiceAreaCheckScreen() {
  const { areaCheck, serviceType, setAreaCheck, setStep } = useBookingStore();
  const form = useForm<AreaCheckFormData>({
    resolver: zodResolver(areaCheckSchema),
    defaultValues: {
      postalCode: areaCheck?.postalCode ?? ""
    }
  });

  const areaMutation = useMutation({
    mutationFn: (values: AreaCheckFormData) =>
      checkServiceArea({
        postalCode: values.postalCode,
        serviceType: serviceType ?? "standard-install"
      }),
    onSuccess: (result) => {
      setAreaCheck(result);
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
    >
      <Card>
        <CardHeader>
          <p className="text-sm font-medium text-muted-foreground">Step 2 of 5</p>
          <h2 id="service-area-heading" className="text-2xl font-semibold">
            Check service availability in your area
          </h2>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4"
            onSubmit={form.handleSubmit(handleSubmit)}
            aria-describedby="area-check-help"
          >
            <p id="area-check-help" className="text-sm text-muted-foreground">
              Selected service: {getServiceLabel(serviceType)}. Supported test postal codes are
              10001, 11201, and 60601.
            </p>

            <div className="grid gap-2">
              <label htmlFor="postalCode" className="text-sm font-medium">
                Postal code
              </label>
              <Input
                id="postalCode"
                inputMode="numeric"
                data-agent-field="postal-code"
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
              <Button variant="secondary" onClick={() => setStep("service-selection")}>
                Back to service selection
              </Button>
            </div>
          </form>

          {areaCheck && (
            <Alert
              className="mt-5"
              variant={areaCheck.available ? "success" : "danger"}
              role="status"
              data-testid="availability-status"
              data-agent-availability={areaCheck.available ? "supported" : "unsupported"}
            >
              <div className="flex gap-2">
                {areaCheck.available ? (
                  <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 text-accent" />
                ) : (
                  <AlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 text-destructive" />
                )}
                <div>
                  <p className="font-medium">{areaCheck.message}</p>
                  <p className="text-muted-foreground">
                    Postal code: {areaCheck.postalCode}
                    {areaCheck.city ? ` · Area: ${areaCheck.city}` : ""}
                  </p>
                </div>
              </div>
            </Alert>
          )}

          <div className="mt-5">
            <Button
              disabled={!areaCheck?.available}
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
