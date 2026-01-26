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
import { API_BASE_URL, API_ENDPOINTS } from "../../../constants/api";
import type {
  User,
  ApiError,
  LoginResponse,
  RegisterResponse,
  ActivationResponse,
  ApiResponse,
} from "../../../types";
// import { cookies } from "next/headers";
  
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
      // Backend returns: { status: "ok", data: User }
      const response = await apiClient.get<ApiResponse<User>>(API_ENDPOINTS.USER.ME);

      console.log("response", response);
      const userData = response.data.data;
      
      // Update localStorage with fresh data (client-side only)
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(userData));
      }
      
      return userData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    // Use placeholderData from localStorage to avoid hydration mismatch
    placeholderData: () => {
      if (typeof window === "undefined") {
        return undefined;
      }
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          return JSON.parse(stored) as User;
        }
      } catch {
        // Ignore parse errors
      }
      return undefined;
    },
  });

  // Derived flags - computed from user data
  const derivedFlags = useMemo(() => {
    const user = query.data;
    
    return {
      // Authentication status
      isAuthenticated: Boolean(user),
      // Activation status
      isActivated: Boolean(user?.activated),
      // Onboarding status
      onboardingStep: user?.onboarding_step,
      isOnboardingComplete: user?.onboarding_step === "completed",
    };
  }, [query.data]);

  return {
    // Raw data
    user: query.data ?? null,
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
 * 
 * Note: Login is a public endpoint - no Bearer token in headers
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, ApiError, { email: string; password: string }>({
    mutationFn: async (credentials) => {
      // Use fetch directly for public endpoints (no Bearer token needed)
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // For cookies
        body: JSON.stringify(credentials),
      });

      console.log("login response", response);

      if (!response.ok) {
        const errorData = await response.json();
        const apiError: ApiError = {
          code: errorData.error?.code || "unknown_error",
          message: errorData.error?.message || response.statusText,
          details: errorData.error?.details,
        };
        throw apiError;
      }

      const data = await response.json() as ApiResponse<LoginResponse>;
      const loginData = data.data;
      
      // Establish session via Next.js API route
      // This sets HTTP cookies that middleware and API routes can read
      // Cookies are the ONLY source of truth - no localStorage
      // Backend SHOULD set cookies directly, but this route acts as a bridge
      // if backend cannot set cross-domain cookies
      const sessionResponse = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important: include cookies in request/response
        body: JSON.stringify(loginData), // Send full login response
      });

      console.log("session response", sessionResponse);
      
      if (!sessionResponse.ok) {
        const errorText = await sessionResponse.text();
        throw new Error(`Failed to establish session: ${errorText}`);
      }
      
      // Persist user in localStorage
      if (loginData.user && typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(loginData.user));
      }
      
      // Set user in TanStack Query cache immediately
      queryClient.setQueryData(authKeys.user(), loginData.user);
      
      return loginData;
    },
  });
}

/**
 * Register mutation
 * Backend returns: { status: "ok", data: { user_id, message } }
 * Creates new user account (inactive until activation)
 * 
 * Note: Register is a public endpoint - no Bearer token in headers
 */
export function useRegister() {
  return useMutation<
    RegisterResponse,
    ApiError,
    { username: string; email: string; password: string; accepted_terms: boolean }
  >({
    mutationFn: async (data) => {
      // Use fetch directly for public endpoints (no Bearer token needed)
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REGISTER}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // For cookies
        body: JSON.stringify(data),
      });

      console.log("register response", response);

      if (!response.ok) {
        const errorData = await response.json();
        const apiError: ApiError = {
          code: errorData.error?.code || "unknown_error",
          message: errorData.error?.message || response.statusText,
          details: errorData.error?.details || errorData,
        };
        throw apiError;
      }

      const result = await response.json() as ApiResponse<RegisterResponse>;
      return result.data;
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
      // Use fetch directly for public endpoints (no Bearer token needed)
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.ACTIVATE}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // For cookies
        body: JSON.stringify({ token }),
      });

      console.log("activate account response", response);

      if (!response.ok) {
        const errorData = await response.json();
        const apiError: ApiError = {
          code: errorData.error?.code || "unknown_error",
          message: errorData.error?.message || response.statusText,
          details: errorData.error?.details,
        };
        throw apiError;
      }

      const result = await response.json() as ApiResponse<ActivationResponse>;
      return result.data;
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
 * Note: Resend activation is a public endpoint - no Bearer token in headers
 */
export function useResendActivation() {
  return useMutation<{ message: string }, ApiError, { email: string }>({
    mutationFn: async ({ email }) => {
      // Use fetch directly for public endpoints (no Bearer token needed)
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.RESEND_ACTIVATION}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // For cookies
        body: JSON.stringify({ email }),
      });

      console.log("resend activation response", response);

      if (!response.ok) {
        const errorData = await response.json();
        const apiError: ApiError = {
          code: errorData.error?.code || "unknown_error",
          message: errorData.error?.message || response.statusText,
          details: errorData.error?.details,
        };
        throw apiError;
      }

      const result = await response.json() as ApiResponse<{ message: string }>;
      return result.data;
    },
  });
}

/**
 * Logout mutation
 * Clears tokens, user data, and all queries on success
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, void>({
    mutationFn: async () => {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    },
    onSuccess: () => {
      // Clear localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
      }
     
      // Clear TanStack Query cache
      queryClient.clear();
    },
  });
}
