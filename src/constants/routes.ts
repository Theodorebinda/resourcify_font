/**
 * Route constants for Ressourcefy
 * Centralized route definitions
 */

export const ROUTES = {
  // Public routes
  HOME: "/",
  FEATURES: "/#features", // Section features dans l'accueil
  PRICING: "/#pricing", // Section pricing dans l'accueil
  BLOG: "/blog",
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
    PROFILE: "/app/profile",
    SETTINGS: "/app/settings",
  },

  // Admin routes
  ADMIN: {
    ROOT: "/admin",
    DASHBOARD: "/admin/dashboard",
    USERS: "/admin/users",
    TAGS: "/admin/tags",
    RESOURCES: "/admin/resources",
    SUBSCRIPTIONS: "/admin/subscriptions",
    PAYMENTS: "/admin/payments",
  },
} as const;
