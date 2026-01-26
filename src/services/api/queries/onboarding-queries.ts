/**
 * TanStack Query hooks for Onboarding
 * 
 * Server-driven onboarding flow
 * The backend exposes onboarding_step and the frontend reads it.
 * The frontend NEVER infers or guesses the step.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client";
import { API_ENDPOINTS } from "../../../constants/api";
import { authKeys } from "./auth-queries";
import type { OnboardingStep, ApiError, ApiResponse } from "../../../types";

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

export function useStartOnboarding() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, void>({
    mutationFn: async () => {
      await apiClient.post<ApiResponse<{ message?: string }>>(
        API_ENDPOINTS.ONBOARDING.START
      );
    },
    onSuccess: async () => {
      // Invalider authKeys.user() (source unique de vérité)
      // Conforme à ONBOARDING_REFONTE.md - RÈGLE #7
      await queryClient.invalidateQueries({ queryKey: authKeys.user() });
      // Optionnel: invalider aussi onboardingKeys.step()
      queryClient.invalidateQueries({ queryKey: onboardingKeys.step() });
    },
  });
}

export interface OnboardingProfilePayload {
  username: string;
  bio?: string;
  avatar_url?: string;
}

export interface OnboardingInterestsPayload {
  tag_ids: string[];
}

export function useSubmitOnboardingProfile() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, OnboardingProfilePayload>({
    mutationFn: async (payload) => {
      await apiClient.post<ApiResponse<{ message?: string }>>(
        API_ENDPOINTS.ONBOARDING.PROFILE,
        payload
      );
    },
    onSuccess: async () => {
      // Invalider authKeys.user() (source unique de vérité)
      // Conforme à ONBOARDING_REFONTE.md - RÈGLE #7
      await queryClient.invalidateQueries({ queryKey: authKeys.user() });
      // Optionnel: invalider aussi onboardingKeys.step()
      queryClient.invalidateQueries({ queryKey: onboardingKeys.step() });
    },
  });
}

export function useSubmitOnboardingInterests() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, OnboardingInterestsPayload>({
    mutationFn: async (payload) => {
      await apiClient.post<ApiResponse<{ message?: string }>>(
        API_ENDPOINTS.ONBOARDING.INTERESTS,
        payload
      );
    },
    onSuccess: async () => {
      // Invalider authKeys.user() (source unique de vérité)
      // Conforme à ONBOARDING_REFONTE.md - RÈGLE #7
      await queryClient.invalidateQueries({ queryKey: authKeys.user() });
      // Optionnel: invalider aussi onboardingKeys.step()
      queryClient.invalidateQueries({ queryKey: onboardingKeys.step() });
    },
  });
}
