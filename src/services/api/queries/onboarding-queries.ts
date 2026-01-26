/**
 * TanStack Query hooks for Onboarding
 * 
 * Server-driven onboarding flow
 * The backend exposes onboarding_step and the frontend reads it.
 * The frontend NEVER infers or guesses the step.
 */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../client";
import { API_ENDPOINTS } from "../../../constants/api";
import type { OnboardingStep, ApiError } from "../../../types";

// Query keys
export const onboardingKeys = {
  all: ["onboarding"] as const,
  step: () => [...onboardingKeys.all, "step"] as const,
};

/**
 * Get current onboarding step from server
 * 
 * This is the SINGLE SOURCE OF TRUTH for onboarding state.
 * The frontend reads this value and never infers it.
 * 
 * Returns the current onboarding_step from the backend.
 */
export function useOnboardingStep() {
  return useQuery<OnboardingStep, ApiError>({
    queryKey: onboardingKeys.step(),
    queryFn: async () => {
      // The backend endpoint returns { onboarding_step: "not_started" | "profile" | "interests" | "completed" }
      const response = await apiClient.get<{ onboarding_step: OnboardingStep }>(
        API_ENDPOINTS.ONBOARDING.STATUS
      );

      const step = response.data?.onboarding_step;
      if (!step) {
        const apiError: ApiError = {
          code: "invalid_response",
          message: "Missing onboarding_step in response",
          details: response.data as Record<string, unknown>,
        };
        throw apiError;
      }

      return step;
    },
    staleTime: 30 * 1000, // 30 seconds - onboarding state can change frequently
    retry: 1,
  });
}
