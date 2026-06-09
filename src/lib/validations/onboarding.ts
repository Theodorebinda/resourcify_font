/**
 * Onboarding validation schemas
 * Using Zod for form validation
 */

import { z } from "zod";

export const profileSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters"),
  bio: z
    .string()
    .max(500, "Bio must be less than 500 characters")
    .optional(),
});

export const interestsSchema = z.object({
  interests: z
    .array(z.string())
    .min(1, "Please select at least one interest")
    .max(10, "Please select at most 10 interests"),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
export type InterestsFormData = z.infer<typeof interestsSchema>;
