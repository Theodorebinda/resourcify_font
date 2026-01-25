/**
 * User State Machine
 * 
 * Formal definition of user states and transitions.
 * 
 * States:
 * - VISITOR: Not authenticated
 * - AUTHENTICATED: Authenticated but not activated
 * - ACTIVATED: Activated but not onboarded
 * - ONBOARDING.profile: Onboarding step 1
 * - ONBOARDING.interests: Onboarding step 2
 * - APP_READY: Fully onboarded, can access app
 * 
 * Rules:
 * - States are derived from server data (cookies)
 * - No client-side inference
 * - Deterministic: same input → same output
 */

import type { AuthCookie, OnboardingStep } from "../types";

export type UserState =
  | "VISITOR"
  | "AUTHENTICATED"
  | "ACTIVATED"
  | "ONBOARDING.profile"
  | "ONBOARDING.interests"
  | "APP_READY";

/**
 * Derives user state from auth cookie
 * 
 * Deterministic function: same input → same output
 * No side effects, no async logic
 */
export function getUserState(authCookie: AuthCookie | null): UserState {
  // No auth cookie = VISITOR
  if (!authCookie) {
    return "VISITOR";
  }

  // Has token but not activated = AUTHENTICATED
  if (!authCookie.activated) {
    return "AUTHENTICATED";
  }

  // Activated - check onboarding step
  const step = authCookie.onboardingStep || "not_started";

  // Map onboarding step to state
  switch (step) {
    case "not_started":
      return "ACTIVATED";
    case "profile":
      return "ONBOARDING.profile";
    case "interests":
      return "ONBOARDING.interests";
    case "completed":
      return "APP_READY";
    default:
      // Unknown step - treat as ACTIVATED (safe fallback)
      return "ACTIVATED";
  }
}

/**
 * Get the onboarding step from user state
 */
export function getOnboardingStepFromState(state: UserState): OnboardingStep | null {
  switch (state) {
    case "VISITOR":
    case "AUTHENTICATED":
    case "ACTIVATED":
      return "not_started";
    case "ONBOARDING.profile":
      return "profile";
    case "ONBOARDING.interests":
      return "interests";
    case "APP_READY":
      return "completed";
    default:
      return null;
  }
}
