/**
 * Cookie utilities for middleware
 * Phase 1: Minimal cookie parsing
 * TODO: Replace with secure cookie handling in Phase 2
 */

import { cookies } from "next/headers";
import type { AuthCookie } from "../types";

import type { OnboardingStep } from "../types";

/**
 * Parse auth cookie from Next.js cookies()
 * Returns minimal auth state for middleware access control
 * 
 * Reads:
 * - authenticated? (token + userId)
 * - is_active? (activated)
 * - onboarding_step? (current step from server)
 */
export async function getAuthCookie(): Promise<AuthCookie | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const userId = cookieStore.get("user_id")?.value;
    const activated = cookieStore.get("user_activated")?.value === "true";
    
    // Read onboarding_step from cookie (set by backend)
    // This is the source of truth - never infer or guess
    const onboardingStepCookie = cookieStore.get("onboarding_step")?.value;
    const onboardingStep: OnboardingStep | undefined = 
      onboardingStepCookie && 
      ["not_started", "profile", "interests", "completed"].includes(onboardingStepCookie)
        ? (onboardingStepCookie as OnboardingStep)
        : undefined;

    if (!token || !userId) {
      return null;
    }

    return {
      token,
      userId,
      activated,
      onboardingStep,
    };
  } catch {
    return null;
  }
}
