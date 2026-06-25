// @ts-check

import { z } from "zod";

export const updateCustomerSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  email: z.string().trim().email("Enter a valid email."),
  phone: z.string().trim().min(7, "Phone number is required."),
});

export const addVehicleSchema = z.object({
  year: z.coerce.number().int().min(1980).max(2035),
  make: z.string().trim().min(1, "Make is required."),
  model: z.string().trim().min(1, "Model is required."),
  color: z.string().trim().min(1, "Color is required."),
  licensePlate: z.string().trim().min(2, "License plate is required.").toUpperCase(),
});

export const cancelSubscriptionSchema = z.object({
  reason: z.string().trim().max(300).optional(),
});
