/**
 * API Client setup
 * Phase 1: Minimal axios configuration
 * TODO: Add interceptors, error handling, token refresh in Phase 2
 */

import axios from "axios";
import { API_BASE_URL } from "../../../constants/api";
import type { ApiError } from "../../../types";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // For cookie-based auth
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Transform axios errors to ApiError format
    const apiError: ApiError = {
      code: error.response?.data?.code || "unknown_error",
      message: error.response?.data?.message || error.message,
      details: error.response?.data?.details,
    };

    return Promise.reject(apiError);
  }
);
