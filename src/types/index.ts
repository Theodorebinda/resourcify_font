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

/**
 * Onboarding step - Server-driven source of truth
 * 
 * The backend exposes this field and the frontend MUST read it.
 * The frontend NEVER infers or guesses the step.
 * All onboarding transitions must be validated by the backend.
 * Skipping steps is forbidden.
 */
export type OnboardingStep =
  | "not_started"
  | "profile"
  | "interests"
  | "completed";

// Auth cookie structure (minimal payload for middleware)
export interface AuthCookie {
  token?: string;
  userId?: string;
  activated?: boolean;
  /**
   * Current onboarding step from server
   * This is the source of truth - never infer or guess
   */
  onboardingStep?: OnboardingStep;
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
  username: string;
  name?: string;
  activated: boolean;
  /**
   * Current onboarding step - server is the source of truth
   * Frontend reads this value and never infers it
   */
  onboarding_step: OnboardingStep;
  createdAt?: string;
}

// Login response from backend
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

// Register response from backend
export interface RegisterResponse {
  user_id: string;
  message: string;
}

// Activation response from backend
export interface ActivationResponse {
  message: string;
}

// API Response wrapper (backend returns { status: "ok", data: {...} })
export interface ApiResponse<T> {
  status: "ok";
  data: T;
}

// API Error response wrapper (backend returns { error: {...} })
export interface ApiErrorResponse {
  error: ApiError;
}

// Middleware redirect target
export type RedirectTarget =
  | "/"
  | "/auth/login"
  | "/onboarding/activation-required"
  | "/onboarding/profile"
  | "/app";
