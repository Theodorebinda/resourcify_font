/**
 * Hook for handling TanStack Query server errors
 * 
 * Detects infrastructure-level errors (5xx, network, timeout)
 * and provides error handling utilities
 * 
 * Usage:
 * const { data, error } = useQuery(...);
 * const serverError = useServerError(error);
 * 
 * if (serverError) {
 *   return <SomethingWentWrong onRetry={() => refetch()} />;
 * }
 */

"use client";

import { useMemo } from "react";
import type { ApiError } from "../types";

interface ServerError {
  isServerError: boolean;
  message: string;
  retry?: () => void;
}

/**
 * Determines if an error is an infrastructure-level server error
 * (5xx, network, timeout) vs a business error (4xx, validation)
 */
function isInfrastructureError(error: unknown): boolean {
  if (!error) return false;

  // Check if it's an ApiError with 5xx code
  if (typeof error === "object" && "code" in error) {
    const apiError = error as ApiError;
    // Infrastructure errors typically have codes like "server_error", "timeout", "network_error"
    const infrastructureCodes = [
      "server_error",
      "timeout",
      "network_error",
      "service_unavailable",
      "internal_server_error",
    ];
    return infrastructureCodes.includes(apiError.code);
  }

  // Check axios error for 5xx status
  if (
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "status" in error.response
  ) {
    const status = (error.response as { status: number }).status;
    return status >= 500 && status < 600;
  }

  // Check for network errors (no response)
  if (
    typeof error === "object" &&
    "code" in error &&
    (error.code === "ECONNREFUSED" ||
      error.code === "ETIMEDOUT" ||
      error.code === "ERR_NETWORK")
  ) {
    return true;
  }

  return false;
}

export function useServerError(
  error: unknown,
  retry?: () => void
): ServerError | null {
  return useMemo(() => {
    if (!error || !isInfrastructureError(error)) {
      return null;
    }

    let message = "Something went wrong on our end. Please try again in a moment.";

    if (typeof error === "object" && "message" in error) {
      const errorMessage = (error as { message: string }).message;
      // Only use error message if it's user-friendly
      if (
        errorMessage &&
        !errorMessage.includes("ECONNREFUSED") &&
        !errorMessage.includes("ETIMEDOUT") &&
        !errorMessage.includes("ERR_NETWORK")
      ) {
        message = errorMessage;
      }
    }

    return {
      isServerError: true,
      message,
      retry,
    };
  }, [error, retry]);
}
