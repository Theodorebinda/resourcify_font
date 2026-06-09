/**
 * TanStack Query hooks for Billing
 * 
 * Handles Stripe checkout session creation
 */

import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../client";
import { API_ENDPOINTS } from "../../../constants/api";
import type { ApiError, ApiResponse } from "../../../types";

// Types
export interface CreateCheckoutSessionPayload {
  price_id: string;
  success_url: string;
  cancel_url: string;
}

export interface CreateCheckoutSessionResponse {
  sessionId: string;
}

/**
 * Create a Stripe checkout session
 */
export function useCreateCheckoutSession() {
  return useMutation<CreateCheckoutSessionResponse, ApiError, CreateCheckoutSessionPayload>({
    mutationFn: async (payload) => {
      const response = await apiClient.post<ApiResponse<CreateCheckoutSessionResponse>>(
        API_ENDPOINTS.BILLING.CHECKOUT,
        payload
      );
      return response.data.data;
    },
  });
}
