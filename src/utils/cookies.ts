/**
 * Cookie utilities for middleware
 * Phase 1: Minimal cookie parsing
 * TODO: Replace with secure cookie handling in Phase 2
 */

import { cookies } from "next/headers";
import type { AuthCookie } from "../types";

/**
 * Parse auth cookie from Next.js cookies()
 * Returns minimal auth state for middleware access control
 */
export async function getAuthCookie(): Promise<AuthCookie | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const userId = cookieStore.get("user_id")?.value;
    const activated = cookieStore.get("user_activated")?.value === "true";
    const onboardingCompleted =
      cookieStore.get("onboarding_completed")?.value === "true";

    if (!token || !userId) {
      return null;
    }

    return {
      token,
      userId,
      activated,
      onboardingCompleted,
    };
  } catch {
    return null;
  }
}
