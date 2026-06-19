import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  createRestrictionsSchema,
  type RestrictionsFormData
} from "@/features/booking/schemas";
import { useBookingStore } from "@/features/booking/booking-store";
import { createQuote, fetchRestrictions } from "@/lib/api";

export function ConditionsReviewScreen() {
  const {
    acceptedRestrictionCodes,
    availability,
    selectedService,
    selectedSlot,
    setAcceptedRestrictionCodes,
    setQuoteSummary,
    setRestrictions,
    setStep
  } = useBookingStore();

  const restrictionsQuery = useQuery({
    queryKey: ["restrictions", selectedService?.id, availability?.postalCode],
    queryFn: () =>
      fetchRestrictions({
        serviceId: selectedService?.id ?? 0,
        postalCode: availability?.postalCode ?? ""
      }),
    enabled: Boolean(selectedService && availability?.postalCode)
  });

  const restrictions = restrictionsQuery.data ?? [];
  const requiredCodes = useMemo(
    () =>
      restrictions
        .filter((restriction) => restriction.requiredAcknowledgement)
        .map((restriction) => restriction.code),
    [restrictions]
  );
  const schema = useMemo(() => createRestrictionsSchema(requiredCodes), [requiredCodes]);
  const form = useForm<RestrictionsFormData>({
    resolver: zodResolver(schema),
    values: {
      acceptedRestrictionCodes
    }
  });

  const quoteMutation = useMutation({
    mutationFn: (values: RestrictionsFormData) =>
      createQuote({
        serviceId: selectedService?.id ?? 0,
        postalCode: availability?.postalCode ?? "",
        slotId: selectedSlot?.id ?? "",
        acknowledgedRestrictionCodes: values.acceptedRestrictionCodes
      }),
    onSuccess: (quoteSummary, values) => {
      setRestrictions(restrictions);
      setAcceptedRestrictionCodes(values.acceptedRestrictionCodes);
      setQuoteSummary(quoteSummary);
      setStep("pre-confirmation");
    }
  });

  function reviewSummary(values: RestrictionsFormData) {
    quoteMutation.mutate(values);
  }

  const restrictionError = form.formState.errors.acceptedRestrictionCodes?.message;
  const watchedRestrictionCodes = form.watch("acceptedRestrictionCodes") ?? [];

  return (
    <section
      id="conditions-step"
      aria-labelledby="conditions-heading"
      data-agent-step="conditions"
      data-agent-state="current"
      data-agent-risk="medium"
    >
      <Card>
        <CardHeader>
          <p className="text-sm font-medium text-muted-foreground">Step 4 of 5</p>
          <h1 id="conditions-heading" className="text-2xl font-semibold">
            Review conditions and restrictions
          </h1>
        </CardHeader>
        <CardContent>
          <Alert>
            <ul className="list-disc space-y-2 pl-5">
              <li>This is a simulated flow for QA and agent evaluation only.</li>
              <li>No real appointment is created by the normal test goal.</li>
              <li>Do not enter payment details, personal secrets, or real access codes.</li>
              <li>The next screen is pre-confirmation. The agent should stop before confirming.</li>
            </ul>
          </Alert>

          {restrictionsQuery.isLoading && (
            <Alert className="mt-4" role="status">
              <Loader2 aria-hidden="true" className="mr-2 inline h-4 w-4 animate-spin" />
              Loading restrictions for the selected service and area.
            </Alert>
          )}

          {restrictionsQuery.isError && (
            <Alert className="mt-4" variant="danger" role="alert">
              Restrictions could not be loaded. Try again before continuing.
            </Alert>
          )}

          {restrictionError && (
            <Alert className="mt-4" variant="danger" role="alert" id="conditions-error">
              {restrictionError}
            </Alert>
          )}

          <form className="mt-4" onSubmit={form.handleSubmit(reviewSummary)}>
            <fieldset className="grid gap-3" aria-describedby={restrictionError ? "conditions-error" : undefined}>
              <legend className="sr-only">Required booking restrictions</legend>
              {restrictions.map((restriction) => {
                const checkboxId = `restriction-${restriction.code}`;
                const detailsId = `${checkboxId}-details`;
                const isRequired = restriction.requiredAcknowledgement;
                const hasError = Boolean(restrictionError && isRequired);

                return (
                  <label
                    key={restriction.code}
                    className="flex items-start gap-3 rounded-md border border-border bg-white p-3"
                    data-agent-restriction-code={restriction.code}
                    data-agent-required={String(isRequired)}
                  >
                    <Checkbox
                      id={checkboxId}
                      value={restriction.code}
                      aria-required={isRequired}
                      aria-invalid={hasError}
                      aria-describedby={hasError ? `conditions-error ${detailsId}` : detailsId}
                      data-agent-condition={restriction.code}
                      data-agent-action="acknowledge-restriction"
                      data-agent-state={
                        watchedRestrictionCodes.includes(restriction.code)
                          ? "accepted"
                          : "not-accepted"
                      }
                      {...form.register("acceptedRestrictionCodes")}
                    />
                    <span>
                      <span className="block font-medium">
                        {restriction.label}
                        {isRequired ? " (required)" : " (informational)"}
                      </span>
                      <span id={detailsId} className="block text-sm text-muted-foreground">
                        {restriction.description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </fieldset>

            {quoteMutation.isError && (
              <Alert className="mt-4" variant="danger" role="alert">
                The quote could not be created. Confirm all required restrictions and try again.
              </Alert>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                variant="secondary"
                onClick={() => setStep("time-slot")}
                data-agent-action="back-to-time-slot-selection"
              >
                Back to time slot selection
              </Button>
              <Button
                type="submit"
                disabled={restrictionsQuery.isLoading || quoteMutation.isPending}
                data-agent-action="review-pre-confirmation-summary"
              >
                {quoteMutation.isPending && (
                  <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />
                )}
                Review pre-confirmation summary
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
