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
import { useMemo, useState, useEffect } from "react";
import { apiClient } from "../client";
import { API_ENDPOINTS } from "../../../constants/api";
import type {
  User,
  ApiError,
  LoginResponse,
  RegisterResponse,
  ActivationResponse,
  ApiResponse,
} from "../../../types";

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
  // Use state to prevent hydration mismatch
  // Start with false, then check localStorage after mount
  const [isMounted, setIsMounted] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setHasToken(!!localStorage.getItem("access_token"));
  }, []);

  const query = useQuery<User, ApiError>({
    queryKey: authKeys.user(),
    queryFn: async () => {
      // Backend returns: { status: "ok", data: User }
      const response = await apiClient.get<ApiResponse<User>>(API_ENDPOINTS.USER.ME);
      const userData = response.data.data;
      
      // Update cookies with latest user state (for middleware)
      // This ensures middleware has correct activated/onboarding_step values
      // Only update cookies on client side after mount
      if (isMounted) {
        try {
          await fetch("/api/auth/set-cookies", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              access_token: localStorage.getItem("access_token") || "",
              user_id: userData.id,
              user_activated: userData.activated,
              onboarding_step: userData.onboarding_step || "not_started",
            }),
          });
        } catch (cookieError) {
          // Silent fail - cookies update is best effort
          console.debug("Failed to update cookies:", cookieError);
        }
      }
      
      return userData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    // Only fetch if mounted (client-side) and token exists
    // This prevents hydration mismatch
    enabled: isMounted && hasToken,
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
 * Backend returns: { status: "ok", data: { access_token, refresh_token, user } }
 * On success, stores tokens, sets cookies via API route, and invalidates user query
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, ApiError, { email: string; password: string }>({
    mutationFn: async (credentials) => {
      const response = await apiClient.post<ApiResponse<LoginResponse>>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );
      
      const loginData = response.data.data;
      
      // Store tokens in localStorage (for API client)
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", loginData.access_token);
        localStorage.setItem("refresh_token", loginData.refresh_token);
        
        // Set cookies via Next.js API route (for middleware)
        // This allows middleware to detect authenticated state
        // Note: Backend login response may not include activated/onboarding_step
        // We'll use defaults and let /user/me update them on next request
        try {
          const cookieResponse = await fetch("/api/auth/set-cookies", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              access_token: loginData.access_token,
              user_id: loginData.user.id,
              // Default values - will be updated when /user/me is called
              user_activated: false, // Assume not activated until confirmed
              onboarding_step: "not_started", // Default onboarding step
            }),
          });
          
          if (!cookieResponse.ok) {
            console.error("Failed to set cookies:", await cookieResponse.text());
          }
        } catch (cookieError) {
          console.error("Failed to set cookies:", cookieError);
          // Continue even if cookie setting fails - tokens are in localStorage
        }
      }
      
      return loginData;
    },
    onSuccess: () => {
      // Invalidate user query to refetch
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
}

/**
 * Register mutation
 * Backend returns: { status: "ok", data: { user_id, message } }
 * Creates new user account (inactive until activation)
 */
export function useRegister() {
  return useMutation<
    RegisterResponse,
    ApiError,
    { username: string; email: string; password: string; accepted_terms: boolean }
  >({
    mutationFn: async (data) => {
      const response = await apiClient.post<ApiResponse<RegisterResponse>>(
        API_ENDPOINTS.AUTH.REGISTER,
        data
      );
      return response.data.data;
    },
  });
}

/**
 * Activate account mutation
 * Backend returns: { status: "ok", data: { message } }
 * Activates account using token from email
 */
export function useActivateAccount() {
  const queryClient = useQueryClient();

  return useMutation<ActivationResponse, ApiError, { token: string }>({
    mutationFn: async ({ token }) => {
      const response = await apiClient.post<ApiResponse<ActivationResponse>>(
        API_ENDPOINTS.AUTH.ACTIVATE,
        { token }
      );
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidate user query to refetch
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
}

/**
 * Resend activation email mutation
 * Sends a new activation email to the user
 * Used when user tries to login but account is not activated
 * 
 * Backend requires: { email: string } in body
 */
export function useResendActivation() {
  return useMutation<{ message: string }, ApiError, { email: string }>({
    mutationFn: async ({ email }) => {
      // Backend endpoint: POST /auth/resend-activation/
      // Body: { email: string } (required)
      const response = await apiClient.post<ApiResponse<{ message: string }>>(
        API_ENDPOINTS.AUTH.RESEND_ACTIVATION,
        { email }
      );
      return response.data.data;
    },
  });
}

/**
 * Logout mutation
 * Clears tokens and all queries on success
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, void>({
    mutationFn: async () => {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    },
    onSuccess: () => {
      // Clear tokens
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
      // Clear all queries
      queryClient.clear();
    },
  });
}
