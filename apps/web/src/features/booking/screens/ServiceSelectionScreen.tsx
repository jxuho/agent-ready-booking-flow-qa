import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { serviceOptions } from "@/features/booking/constants";
import { serviceSelectionSchema, type ServiceSelectionFormData } from "@/features/booking/schemas";
import { useBookingStore } from "@/features/booking/booking-store";

export function ServiceSelectionScreen() {
  const { serviceType, selectService } = useBookingStore();
  const form = useForm<ServiceSelectionFormData>({
    resolver: zodResolver(serviceSelectionSchema),
    defaultValues: {
      serviceType: serviceType ?? "standard-install"
    }
  });

  function handleSubmit(values: ServiceSelectionFormData) {
    selectService(values.serviceType);
  }

  return (
    <section
      id="service-selection-step"
      aria-labelledby="service-selection-heading"
      data-agent-step="service-selection"
    >
      <Card>
        <CardHeader>
          <p className="text-sm font-medium text-muted-foreground">Step 1 of 5</p>
          <h2 id="service-selection-heading" className="text-2xl font-semibold">
            Select a simulated service
          </h2>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="grid gap-2">
              <label htmlFor="serviceType" className="text-sm font-medium">
                Service type
              </label>
              <select
                id="serviceType"
                className="min-h-10 rounded-md border border-input bg-white px-3 py-2 text-base"
                data-agent-field="service-type"
                {...form.register("serviceType")}
              >
                {serviceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {serviceOptions.map((option) => (
                <div
                  key={option.value}
                  className="rounded-md border border-border bg-muted p-3 text-sm"
                  data-agent-service-option={option.value}
                >
                  <h3 className="font-semibold">{option.label}</h3>
                  <p className="mt-1 text-muted-foreground">{option.description}</p>
                </div>
              ))}
            </div>

            <Button type="submit" className="w-fit" data-agent-action="continue-to-area-check">
              Continue to service area check
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
