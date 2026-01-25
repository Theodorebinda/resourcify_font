/**
 * API Client setup
 * 
 * Centralized Axios client that proxies requests through Next.js API routes.
 * 
 * Architecture:
 * - Tokens are stored ONLY in httpOnly cookies (set by /api/auth/session)
 * - All API calls go through /api/proxy/* routes
 * - Proxy routes read access_token from cookies and attach to backend requests
 * - No client-side token exposure
 * 
 * Features:
 * - Automatic proxying through /api/proxy
 * - Centralized error handling
 * - Handles token refresh on 401 (future)
 */

import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { ApiError } from "../../types";

/**
 * Get proxy URL for backend endpoint
 * Converts: /user/me/ -> /api/proxy/user/me/
 */
function getProxyUrl(endpoint: string): string {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return `/api/proxy/${cleanEndpoint}`;
}

/**
 * Create Axios client instance
 * 
 * Base URL is empty - we'll use proxy routes
 * All requests go through /api/proxy/*
 */
export const apiClient = axios.create({
  baseURL: "", // Empty - we use proxy routes
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important: include cookies in requests
});

/**
 * Request Interceptor
 * 
 * Converts backend endpoints to proxy routes.
 * 
 * Flow:
 * 1. Intercept request to backend endpoint (e.g., /user/me/)
 * 2. Convert to proxy route (e.g., /api/proxy/user/me/)
 * 3. Proxy route reads access_token from httpOnly cookie
 * 4. Proxy route makes request to backend with token
 * 
 * No token handling in client - all done server-side via cookies.
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Convert backend endpoint to proxy route
    if (config.url) {
      config.url = getProxyUrl(config.url);
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
    console.log("[API Error]", {
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
