import { z } from "zod";

export const serviceSelectionSchema = z.object({
  serviceType: z.enum(["standard-install", "repair-visit", "equipment-delivery"])
});

export const areaCheckSchema = z.object({
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "Enter a 5-digit postal code.")
});

export type ServiceSelectionFormData = z.infer<typeof serviceSelectionSchema>;
export type AreaCheckFormData = z.infer<typeof areaCheckSchema>;
