/**
 * API constants
 * Phase 1: Placeholder endpoints
 * TODO: Replace with actual backend endpoints in Phase 2
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: "/auth/login/",
    REGISTER: "/auth/register/",
    LOGOUT: "/auth/logout/",
    REFRESH: "/auth/refresh",
    FORGOT_PASSWORD: "/auth/forgot-password/",
    RESET_PASSWORD: "/auth/reset-password/",
    ACTIVATE: "/auth/activate/",
    RESEND_ACTIVATION: "/auth/resend-activation/",
  },

  // User endpoints
  USER: {
    ME: "/user/me/",
    PROFILE: "/user/profile/",
    UPDATE_PROFILE: "/user/profile/",
  },

  // Onboarding endpoints
  ONBOARDING: {
    STATUS: "/onboarding/status/",
    PROFILE: "/onboarding/profile/",
    INTERESTS: "/onboarding/interests/",
    COMPLETE: "/onboarding/complete/ ",
  },
} as const;
