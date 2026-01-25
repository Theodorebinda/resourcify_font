/**
 * API Client setup
 * Phase 1: Minimal axios configuration
 * TODO: Add interceptors, error handling, token refresh in Phase 2
 */

import axios from "axios";
import { API_BASE_URL } from "../../constants/api";
import type { ApiError } from "../../types";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // For cookie-based auth
});

// Request interceptor - Add JWT token to requests
apiClient.interceptors.request.use(
  (config) => {
    // Get access token from localStorage (if available)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Backend returns errors in format: { error: { code, message, details? } }
    // Or validation errors: { field_name: ["error message"] }
    if (error.response?.data?.error) {
      const apiError: ApiError = {
        code: error.response.data.error.code || "unknown_error",
        message: error.response.data.error.message || error.message,
        details: error.response.data.error.details,
      };
      return Promise.reject(apiError);
    }

    // Handle validation errors (field-specific)
    if (error.response?.status === 400 && error.response?.data) {
      const apiError: ApiError = {
        code: "validation_error",
        message: "Validation failed",
        details: error.response.data,
      };
      return Promise.reject(apiError);
    }

    // Generic error
    const apiError: ApiError = {
      code: error.response?.status?.toString() || "unknown_error",
      message: error.message || "An unexpected error occurred",
      details: error.response?.data,
    };

    return Promise.reject(apiError);
  }
);
