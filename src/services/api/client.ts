/**
 * API Client setup
 * 
 * Centralized Axios client that proxies requests through Next.js API routes.
 * 
 * Architecture:
 * - Tokens are stored ONLY in httpOnly cookies (set by /api/auth/session)
 * - All API calls go through /api/proxy/* routes
 * - Proxy routes read access_token from cookies and attach Authorization header
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
 * Handles both with and without trailing slashes
 */
function getProxyUrl(endpoint: string): string {
  // Remove leading slash if present
  let cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  // Remove trailing slash for consistency
  cleanEndpoint = cleanEndpoint.endsWith("/") ? cleanEndpoint.slice(0, -1) : cleanEndpoint;
  return `/api/proxy/${cleanEndpoint}/`;
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
 * 4. Proxy route ALWAYS adds Authorization header to backend requests
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
 * Responsibility:
 * - Normalize backend errors into ApiError
 * - Reject with a consistent shape
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    return Promise.reject(normalizeApiError(error));
  }
);

function normalizeApiError(error: AxiosError): ApiError {
  if (error.response?.status === 401) {
    return {
      code: "unauthorized",
      message: "Your session has expired. Please log in again.",
      details: error.response?.data as Record<string, unknown> | undefined,
    };
  }

  if (error.response?.data && typeof error.response.data === "object" && "error" in error.response.data) {
    const errorData = error.response.data as { error: { code?: string; message?: string; details?: unknown } };
    return {
      code: errorData.error.code || "unknown_error",
      message: errorData.error.message || error.message || "An error occurred",
      details: errorData.error.details as Record<string, unknown> | undefined,
    };
  }

  if (error.response?.status === 400 && error.response?.data) {
    return {
      code: "validation_error",
      message: "Validation failed",
      details: error.response.data as Record<string, unknown>,
    };
  }

  return {
    code: error.response?.status?.toString() || "unknown_error",
    message: error.message || "An unexpected error occurred",
    details: error.response?.data as Record<string, unknown> | undefined,
  };
}
