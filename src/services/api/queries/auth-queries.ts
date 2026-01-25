/**
 * TanStack Query hooks for Auth
 * 
 * Formalized contract for user state management.
 * 
 * useUser() is the SINGLE SOURCE OF TRUTH for user identity and state.
 * 
 * Responsibilities:
 * - Fetch user data via TanStack Query
 * - Expose authentication, activation, and onboarding status
 * - Provide derived flags for easy consumption
 * - Centralize user state queries
 * 
 * Non-Responsibilities:
 * - Does NOT store data in Zustand
 * - Does NOT perform redirects
 * - Does NOT handle UI rendering
 * - Does NOT mutate user state directly
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { apiClient } from "../client";
import { API_ENDPOINTS } from "../../../constants/api";
import type { User, ApiError } from "../../../types";

// Query keys
export const authKeys = {
  all: ["auth"] as const,
  user: () => [...authKeys.all, "user"] as const,
};

/**
 * Formalized useUser() Hook Contract
 * 
 * Returns:
 * - Raw user data and error state
 * - Loading states (isLoading, isFetching)
 * - Derived flags (isAuthenticated, isActivated, isOnboardingComplete)
 * - Utilities (refetch)
 * 
 * Usage:
 * ```tsx
 * const { user, isAuthenticated, isActivated, isLoading } = useUser();
 * ```
 */
export function useUser() {
  const query = useQuery<User, ApiError>({
    queryKey: authKeys.user(),
    queryFn: async () => {
      const response = await apiClient.get<User>(API_ENDPOINTS.USER.ME);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    // Only fetch if authenticated (cookie exists)
    enabled: typeof window !== "undefined",
  });

  // Derived flags - computed from user data
  const derivedFlags = useMemo(() => {
    const user = query.data;
    
    return {
      // Authentication status
      isAuthenticated: !!user,
      
      // Activation status
      isActivated: user?.activated ?? false,
      
      // Onboarding status
      isOnboardingComplete: user?.onboarding_step === "completed",
    };
  }, [query.data]);

  return {
    // Raw data
    user: query.data,
    error: query.error ?? null,
    
    // Loading states
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    
    // Derived flags
    ...derivedFlags,
    
    // Utilities
    refetch: query.refetch,
  };
}

/**
 * Login mutation
 * On success, invalidates user query to refetch
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation<User, ApiError, { email: string; password: string }>({
    mutationFn: async (credentials) => {
      const response = await apiClient.post<User>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate user query to refetch
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
}

/**
 * Register mutation
 * Creates new user account
 */
export function useRegister() {
  return useMutation<
    User,
    ApiError,
    { name: string; email: string; password: string }
  >({
    mutationFn: async (data) => {
      const response = await apiClient.post<User>(
        API_ENDPOINTS.AUTH.REGISTER,
        data
      );
      return response.data;
    },
  });
}

/**
 * Activate account mutation
 * Activates account using token from email
 */
export function useActivateAccount() {
  const queryClient = useQueryClient();

  return useMutation<User, ApiError, { token: string }>({
    mutationFn: async ({ token }) => {
      const response = await apiClient.post<User>(
        API_ENDPOINTS.AUTH.ACTIVATE,
        { token }
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate user query to refetch
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
}

/**
 * Resend activation email mutation
 */
export function useResendActivation() {
  return useMutation<void, ApiError, void>({
    mutationFn: async () => {
      await apiClient.post(API_ENDPOINTS.AUTH.ACTIVATE, {
        action: "resend",
      });
    },
  });
}

/**
 * Logout mutation
 * Clears all queries on success
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, void>({
    mutationFn: async () => {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    },
    onSuccess: () => {
      // Clear all queries
      queryClient.clear();
    },
  });
}
