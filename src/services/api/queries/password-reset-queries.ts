/**
 * TanStack Query hooks for Password Reset
 * 
 * Handles password reset requests and confirmations
 */

import { useMutation } from "@tanstack/react-query";
import { API_BASE_URL, API_ENDPOINTS } from "../../../constants/api";
import type { ApiError, ApiResponse } from "../../../types";

// Types
export interface RequestPasswordResetPayload {
  email: string;
}

export interface RequestPasswordResetResponse {
  message: string;
}

export interface ConfirmPasswordResetPayload {
  token: string;
  new_password: string;
}

export interface ConfirmPasswordResetResponse {
  message: string;
}

/**
 * Request a password reset link
 */
export function useRequestPasswordReset() {
  return useMutation<RequestPasswordResetResponse, ApiError, RequestPasswordResetPayload>({
    mutationFn: async (payload) => {
      // Use fetch directly for public endpoints (no Bearer token needed)
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.PASSWORD_RESET}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const apiError: ApiError = {
          code: errorData.error?.code || "unknown_error",
          message: errorData.error?.message || response.statusText,
          details: errorData.error?.details,
        };
        throw apiError;
      }

      const result = await response.json() as ApiResponse<RequestPasswordResetResponse>;
      return result.data;
    },
  });
}

/**
 * Confirm password reset with token
 */
export function useConfirmPasswordReset() {
  return useMutation<ConfirmPasswordResetResponse, ApiError, ConfirmPasswordResetPayload>({
    mutationFn: async (payload) => {
      // Use fetch directly for public endpoints (no Bearer token needed)
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.PASSWORD_RESET_CONFIRM}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          token: payload.token,
          new_password: payload.new_password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const apiError: ApiError = {
          code: errorData.error?.code || "unknown_error",
          message: errorData.error?.message || response.statusText,
          details: errorData.error?.details,
        };
        throw apiError;
      }

      const result = await response.json() as ApiResponse<ConfirmPasswordResetResponse>;
      return result.data;
    },
  });
}
