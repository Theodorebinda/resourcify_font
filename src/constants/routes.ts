/**
 * Route constants for Ressourcefy
 * Centralized route definitions
 */

export const ROUTES = {
  // Public routes
  HOME: "/",
  PRICING: "/pricing",
  ABOUT: "/about",
  CONTACT: "/contact",

  // Auth routes
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    ACTIVATE: "/auth/activate",
    POST_LOGIN: "/auth/post-login", // Canonical post-login entry point
  },

  // Onboarding routes
  ONBOARDING: {
    ROOT: "/onboarding",
    START: "/onboarding/start/",
    ACTIVATION_REQUIRED: "/onboarding/activation-required/",
    PROFILE: "/onboarding/profile/",
    INTERESTS: "/onboarding/interests/",
    DONE: "/onboarding/done/",
  },

  // App routes
  APP: {
    DASHBOARD: "/app",
    USER: "/user",
  },
} as const;
