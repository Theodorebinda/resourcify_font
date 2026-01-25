/**
 * API Client setup
 * 
 * Centralized Axios client with automatic Bearer token injection.
 * 
 * Features:
 * - Automatic token injection from localStorage
 * - Token is added to ALL requests automatically
 * - Handles token refresh on 401 (future)
 * - Centralized error handling
 */

import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "../../constants/api";
import type { ApiError } from "../../types";

/**
 * Get access token from localStorage
 * Safe to call on server (returns null)
 */
function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("access_token");
}

/**
 * Create Axios client instance
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // For cookie-based auth
});

/**
 * Request Interceptor
 * 
 * Automatically injects Bearer token in ALL requests.
 * 
 * Flow:
 * 1. Check if token exists in localStorage
 * 2. If token exists, add Authorization header
 * 3. Token is automatically included in all subsequent requests
 * 
 * This interceptor runs for EVERY request made via apiClient.
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const token = getAccessToken();
    
    // If token exists, add Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // Request error (before sending)
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * 
 * Handles:
 * - API error format transformation
 * - 401 Unauthorized (token expired/invalid)
 * - Validation errors
 * - Generic errors
 * - Logging responses for debugging
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log("[API Response]", {
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
      status: response.status,
      data: response.data,
    });
    
    // Success response - return as-is
    return response;
  },
  async (error: AxiosError) => {
    // Log error responses
    console.error("[API Error]", {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data as unknown,
      message: error.message,
    });

    // Handle 401 Unauthorized (token expired or invalid)
    if (error.response?.status === 401) {
      // Clear invalid token
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
      
      // TODO: Implement token refresh logic here
      // For now, we just clear the token and let the user re-login
      
      const apiError: ApiError = {
        code: "unauthorized",
        message: "Your session has expired. Please log in again.",
        details: error.response?.data as Record<string, unknown> | undefined,
      };
      return Promise.reject(apiError);
    }

    // Backend returns errors in format: { error: { code, message, details? } }
    if (error.response?.data && typeof error.response.data === "object" && "error" in error.response.data) {
      const errorData = error.response.data as { error: { code?: string; message?: string; details?: unknown } };
      const apiError: ApiError = {
        code: errorData.error.code || "unknown_error",
        message: errorData.error.message || error.message || "An error occurred",
        details: errorData.error.details as Record<string, unknown> | undefined,
      };
      return Promise.reject(apiError);
    }

    // Handle validation errors (field-specific)
    if (error.response?.status === 400 && error.response?.data) {
      const apiError: ApiError = {
        code: "validation_error",
        message: "Validation failed",
        details: error.response.data as Record<string, unknown>,
      };
      return Promise.reject(apiError);
    }

    // Generic error
    const apiError: ApiError = {
      code: error.response?.status?.toString() || "unknown_error",
      message: error.message || "An unexpected error occurred",
      details: error.response?.data as Record<string, unknown> | undefined,
    };

    return Promise.reject(apiError);
  }
);
