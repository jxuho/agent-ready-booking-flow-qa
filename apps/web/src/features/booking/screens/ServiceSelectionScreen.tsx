import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { serviceSelectionSchema, type ServiceSelectionFormData } from "@/features/booking/schemas";
import { useBookingStore } from "@/features/booking/booking-store";
import { fallbackServices, fetchServices } from "@/lib/api";

export function ServiceSelectionScreen() {
  const { selectedService, selectService } = useBookingStore();
  const servicesQuery = useQuery({
    queryKey: ["services"],
    queryFn: fetchServices,
    initialData: fallbackServices
  });
  const form = useForm<ServiceSelectionFormData>({
    resolver: zodResolver(serviceSelectionSchema),
    defaultValues: {
      serviceId: selectedService?.id
    }
  });

  function handleSubmit(values: ServiceSelectionFormData) {
    const service = servicesQuery.data?.find((item) => item.id === values.serviceId);
    if (service) {
      selectService(service);
    }
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
          {servicesQuery.isLoading && (
            <Alert role="status">
              <Loader2 aria-hidden="true" className="mr-2 inline h-4 w-4 animate-spin" />
              Loading service types.
            </Alert>
          )}

          {servicesQuery.isError && (
            <Alert variant="danger" role="alert">
              Service types could not be loaded. Try again before continuing.
            </Alert>
          )}

          <form className="grid gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="grid gap-2">
              <label htmlFor="serviceType" className="text-sm font-medium">
                Service type
              </label>
              <select
                id="serviceType"
                className="min-h-10 rounded-md border border-input bg-white px-3 py-2 text-base"
                data-agent-field="service-type"
                aria-invalid={Boolean(form.formState.errors.serviceId)}
                aria-describedby={
                  form.formState.errors.serviceId ? "service-type-error" : "service-type-help"
                }
                {...form.register("serviceId")}
              >
                <option value="">Choose a service</option>
                {servicesQuery.data?.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
              <p id="service-type-help" className="text-sm text-muted-foreground">
                Choose the simulated service an agent should navigate through.
              </p>
              {form.formState.errors.serviceId && (
                <p id="service-type-error" className="text-sm text-destructive">
                  {form.formState.errors.serviceId.message}
                </p>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {servicesQuery.data?.map((option) => (
                <div
                  key={option.id}
                  className="rounded-md border border-border bg-muted p-3 text-sm"
                  data-agent-service-option={option.slug}
                  aria-label={`${option.name}: ${option.description}`}
                >
                  <h3 className="font-semibold">{option.name}</h3>
                  <p className="mt-1 text-muted-foreground">{option.description}</p>
                </div>
              ))}
            </div>

            <Button
              type="submit"
              className="w-fit"
              disabled={!servicesQuery.data?.length}
              data-agent-action="continue-to-area-check"
            >
              Continue to service area check
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
