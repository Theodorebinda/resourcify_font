/**
 * TanStack Query hooks for Auth
 * Phase 1: Placeholder queries
 * TODO: Implement actual API calls in Phase 2
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client";
import { API_ENDPOINTS } from "../../../constants/api";
import type { User, ApiError } from "../../../types";

// Query keys
export const authKeys = {
  all: ["auth"] as const,
  user: () => [...authKeys.all, "user"] as const,
};

/**
 * Get current user
 * Server is the single source of truth
 */
export function useUser() {
  return useQuery<User, ApiError>({
    queryKey: authKeys.user(),
    queryFn: async () => {
      const response = await apiClient.get<User>(API_ENDPOINTS.USER.ME);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

/**
 * Login mutation
 * TODO: Implement in Phase 2
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
 * Logout mutation
 * TODO: Implement in Phase 2
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
