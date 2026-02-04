/**
 * API constants
 * Phase 1: Placeholder endpoints
 * TODO: Replace with actual backend endpoints in Phase 2
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL
  ? process.env.NEXT_PUBLIC_API_BASE_URL
  : "http://127.0.0.1:8000/api";

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: "/auth/login/",
    REGISTER: "/auth/register/",
    LOGOUT: "/auth/logout/",
    REFRESH: "/auth/refresh/",
    PASSWORD_RESET: "/auth/password-reset/",
    PASSWORD_RESET_CONFIRM: "/auth/password-reset/confirm/",
    ACTIVATE: "/auth/activate/",
    RESEND_ACTIVATION: "/auth/resend-activation/",
  },

  // User endpoints
  USER: {
    ME: "/user/me/",
    PROFILE: "/user/profile/",
    UPDATE_PROFILE: "/user/profile/",
    REQUEST_ROLE: "/user/request-role/",
    PROGRESS: "/user/progress/",
  },

  // Onboarding endpoints
  ONBOARDING: {
    STATUS: "/onboarding/status/",
    START: "/onboarding/start/",
    PROFILE: "/onboarding/profile/",
    INTERESTS: "/onboarding/interests/",
    COMPLETE: "/onboarding/complete/",
  },

  // Resource endpoints
  RESOURCES: {
    CREATE: "/resources/",
    UPDATE: (id: string) => `/resources/${id}/`,
    DELETE: (id: string) => `/resources/${id}/delete/`,
    FEED: "/feed/",
    DETAIL: (id: string) => `/resources/${id}/detail/`,
    ACCESS: (id: string) => `/resources/${id}/access/`,
    VERSIONS: "/resources/versions/",
    COMMENTS: (id: string) => `/resources/${id}/comments/`,
    VOTE: "/resources/vote/",
    COMPLETE: (id: string) => `/resources/${id}/complete/`,
    PROGRESS: (id: string) => `/resources/${id}/progress/`,
    USERS_PROGRESS: (id: string) => `/resources/${id}/users-progress/`,
  },

  // Comment endpoints
  COMMENTS: {
    CREATE: "/comments/",
    VOTE: "/comments/vote/",
  },

  // Author endpoints
  AUTHORS: {
    PROFILE: (userId: string) => `/authors/${userId}/`,
  },

  // Tags endpoints (public)
  TAGS: {
    LIST: "/tags/",
  },

  // Billing endpoints
  BILLING: {
    CHECKOUT: "/billing/checkout/",
    WEBHOOK: "/billing/webhook/",
  },

  // Health endpoints
  HEALTH: {
    LIVE: "/health/live/",
    READY: "/health/ready/",
  },

  // Admin endpoints
  ADMIN: {
    // User Management
    USERS: {
      LIST: "/admin/users/",
      DETAIL: (id: string) => `/admin/users/${id}/`,
      UPDATE: (id: string) => `/admin/users/${id}/`,
      DELETE: (id: string) => `/admin/users/${id}/`,
      SET_ROLE: (id: string) => `/admin/users/${id}/set_role/`,
      ACTIVITY: (id: string) => `/admin/users/${id}/activity/`,
      IMPERSONATE: (id: string) => `/admin/users/${id}/impersonate/`,
      RESET_PASSWORD: (id: string) => `/admin/users/${id}/reset_password/`,
    },
    // Tag Management
    TAGS: {
      LIST: "/admin/tags/",
      DETAIL: (id: string) => `/admin/tags/${id}/`,
      CREATE: "/admin/tags/",
      UPDATE: (id: string) => `/admin/tags/${id}/`,
      DELETE: (id: string) => `/admin/tags/${id}/`,
      MERGE: "/admin/tags/merge/",
    },
    // Resource Management
    RESOURCES: {
      LIST: "/admin/resources/",
      DETAIL: (id: string) => `/admin/resources/${id}/`,
      CREATE: "/admin/resources/",
      UPDATE: (id: string) => `/admin/resources/${id}/`,
      DELETE: (id: string) => `/admin/resources/${id}/`,
      ADD_VERSION: (id: string) => `/admin/resources/${id}/versions/`,
    },
    // Subscription Management
    SUBSCRIPTIONS: {
      LIST: "/admin/subscriptions/",
      DETAIL: (id: string) => `/admin/subscriptions/${id}/`,
      UPDATE: (id: string) => `/admin/subscriptions/${id}/`,
      CANCEL: (id: string) => `/admin/subscriptions/${id}/cancel/`,
    },
    // Payment Management
    PAYMENTS: {
      LIST: "/admin/payments/",
      DETAIL: (id: string) => `/admin/payments/${id}/`,
      REFUND: (id: string) => `/admin/payments/${id}/refund/`,
    },
    // Dashboard
    DASHBOARD: {
      OVERVIEW: "/admin/dashboard/overview/",
      ACTIVITY: "/admin/dashboard/activity/",
      SYSTEM_HEALTH: "/admin/dashboard/system-health/",
    },
    // Progress Management (Admin)
    PROGRESS: "/admin/progress/",
  },
} as const;
