/**
 * Next.js Middleware - Deterministic Route Guards
 * 
 * Implements formal user state machine as executable routing guards.
 * 
 * User States:
 * - VISITOR: Not authenticated
 * - AUTHENTICATED: Authenticated but not activated
 * - ACTIVATED: Activated but not onboarded
 * - ONBOARDING.profile: Onboarding step 1
 * - ONBOARDING.interests: Onboarding step 2
 * - APP_READY: Fully onboarded
 * 
 * Rules:
 * - Middleware is the ONLY place that decides redirects
 * - Components must never redirect based on auth/onboarding
 * - Every route must map to allowed states
 * - Deterministic: same input state → same output route
 * - No side effects, no async client logic
 * 
 * Explicitly forbidden:
 * - Redirects in React components
 * - Zustand-based auth logic
 * - Client-side state inference
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuthCookie } from "./utils/cookies";
import { getUserState } from "./utils/user-state";
import { canAccessRoute, getRedirectRouteForState, getPostLoginRedirect, isProtectedRoute } from "./utils/route-guards";
import { ROUTES } from "./constants/routes";

/**
 * Main middleware function
 * 
 * Deterministic: same request → same response
 * No side effects, no async client logic
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Step 1: Check if route is protected
  // Public routes (home, pricing, about, contact, error) are always accessible
  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  // Step 2: Get user state from cookies (minimal payload)
  // This is the ONLY source of truth for user state
  const authCookie = await getAuthCookie();
  const userState = getUserState(authCookie);

  // Step 3: Special handling for post-login route
  // Post-login always redirects based on user state
  if (pathname === ROUTES.AUTH.POST_LOGIN) {
    const redirectRoute = getPostLoginRedirect(userState);
    return NextResponse.redirect(new URL(redirectRoute, request.url));
  }

  // Step 4: Check if user state can access this route
  // Deterministic check: same state + route → same result
  if (canAccessRoute(userState, pathname)) {
    return NextResponse.next();
  }

  // Step 5: User cannot access route → redirect to correct route for their state
  // Deterministic redirect: same state → same redirect route
  const redirectRoute = getRedirectRouteForState(userState);
  return NextResponse.redirect(new URL(redirectRoute, request.url));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
