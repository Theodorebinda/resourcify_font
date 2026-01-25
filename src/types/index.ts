/**
 * Core types for Ressourcefy frontend
 * Phase 1: Architecture scaffolding
 */

// User states (explicit state-driven UX)
export type UserState =
  | "unauthenticated"
  | "authenticated_not_activated"
  | "authenticated_activated"
  | "onboarding_in_progress"
  | "fully_onboarded";

// Account activation status
export type ActivationStatus = "pending" | "activated" | "expired";

// Onboarding completion status
export type OnboardingStatus = "not_started" | "in_progress" | "completed";

// Auth cookie structure (placeholder - will be replaced by actual backend)
export interface AuthCookie {
  token?: string;
  userId?: string;
  activated?: boolean;
  onboardingCompleted?: boolean;
}

// API Error response structure
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// User data (from server - will be fetched via TanStack Query)
export interface User {
  id: string;
  email: string;
  name?: string;
  activated: boolean;
  onboardingCompleted: boolean;
  createdAt: string;
}

// Middleware redirect target
export type RedirectTarget =
  | "/"
  | "/auth/login"
  | "/onboarding/activation-required"
  | "/onboarding/profile"
  | "/app";
