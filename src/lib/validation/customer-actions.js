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

export const transferSubscriptionSchema = z
  .object({
    fromVehicleId: z.string().trim().min(1, "Select the current vehicle."),
    toVehicleId: z.string().trim().min(1, "Select the new vehicle."),
  })
  .refine((value) => value.fromVehicleId !== value.toVehicleId, {
    message: "Choose two different vehicles.",
    path: ["toVehicleId"],
  });

export const assignVehicleToSubscriptionSchema = z.object({
  vehicleId: z.string().trim().min(1, "Select a vehicle."),
});

export const changeSubscriptionPlanSchema = z.object({
  planId: z.string().trim().min(1, "Select a plan."),
  keepVehicleIds: z.array(z.string().trim().min(1)).optional().default([]),
});

export const startMembershipSchema = z.object({
  planId: z.string().trim().min(1, "Select a plan."),
});
