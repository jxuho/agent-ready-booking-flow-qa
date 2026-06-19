import { z } from "zod";

export const serviceSelectionSchema = z.object({
  serviceId: z.coerce.number().int().positive("Choose a service.")
});

export const areaCheckSchema = z.object({
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "Enter a 5-digit postal code.")
});

export type ServiceSelectionFormData = z.infer<typeof serviceSelectionSchema>;
export type AreaCheckFormData = z.infer<typeof areaCheckSchema>;

export function createRestrictionsSchema(requiredCodes: string[]) {
  return z
    .object({
      acceptedRestrictionCodes: z.array(z.string()).default([])
    })
    .superRefine((value, context) => {
      const accepted = new Set(value.acceptedRestrictionCodes);
      for (const requiredCode of requiredCodes) {
        if (!accepted.has(requiredCode)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Accept all required restrictions before reviewing the quote.",
            path: ["acceptedRestrictionCodes"]
          });
          return;
        }
      }
    });
}

export type RestrictionsFormData = z.infer<ReturnType<typeof createRestrictionsSchema>>;
