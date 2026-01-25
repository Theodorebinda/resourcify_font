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
/**
 * Get auth cookie from Next.js cookies()
 * 
 * Reads cookies set by:
 * - Backend (if backend sets cookies directly)
 * - /api/auth/session route (if backend cannot set cookies)
 * 
 * This is the ONLY source of truth for middleware.
 * Middleware NEVER reads localStorage.
 */
/**
 * Get auth cookie from Next.js cookies()
 * 
 * Reads cookies set by:
 * - Backend (if backend sets cookies directly)
 * - /api/auth/session route (if backend cannot set cookies)
 * 
 * This is the ONLY source of truth for middleware.
 * Middleware NEVER reads localStorage.
 * 
 * Cookies structure:
 * - access_token (httpOnly) - ALWAYS attached as Authorization in proxy routes
 * - refresh_token (httpOnly) - for token refresh
 * - activated (non-httpOnly) - readable by middleware
 * - onboarding_step (non-httpOnly) - readable by middleware
 */
export async function getAuthCookie(): Promise<AuthCookie | null> {
  try {
    const cookieStore = await cookies();
    
    // Read access_token (httpOnly cookie set by /api/auth/session or backend)
    const token = cookieStore.get("access_token")?.value;
    
    // Read activated (non-httpOnly, readable by middleware)
    const activated = cookieStore.get("activated")?.value === "true";
    
    // Read onboarding_step from cookie (set by backend or /api/auth/session)
    // This is the source of truth - never infer or guess
    const onboardingStepCookie = cookieStore.get("onboarding_step")?.value;
    const onboardingStep: OnboardingStep | undefined = 
      onboardingStepCookie && 
      ["not_started", "profile", "interests", "completed"].includes(onboardingStepCookie)
        ? (onboardingStepCookie as OnboardingStep)
        : undefined;

    // Must have token to be considered authenticated
    if (!token) {
      return null;
    }

    // Extract user_id from token if needed, or use a separate cookie
    // For now, we'll use token presence as authentication indicator
    // user_id can be extracted from token or stored in separate cookie
    return {
      token,
      userId: token, // Temporary - can be extracted from token or separate cookie
      activated,
      onboardingStep,
    };
  } catch (error) {
    // Silent fail - middleware treats as unauthenticated
    console.debug("[getAuthCookie] Error reading cookies:", error);
    return null;
  }
}
