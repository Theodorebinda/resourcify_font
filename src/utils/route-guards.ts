/**
 * Route Guards - Route → Allowed States Mapping
 * 
 * Defines which user states can access which routes.
 * 
 * Rules:
 * - Every route must have explicit allowed states
 * - Guards are deterministic (no side effects)
 * - Same state + route → same result
 */

import type { UserState } from "./user-state";
import { ROUTES } from "../constants/routes";

/**
 * Post-login route - canonical entry point after login
 * Middleware redirects based on user state
 */
const POST_LOGIN_ROUTE = ROUTES.AUTH.POST_LOGIN;

/**
 * Route category for grouping
 */
export type RouteCategory =
  | "public"
  | "auth"
  | "activation"
  | "onboarding.profile"
  | "onboarding.interests"
  | "onboarding.done"
  | "app";

/**
 * Maps route patterns to allowed user states
 * 
 * Format: route pattern → array of allowed states
 * 
 * Rules:
 * - Public routes (home, pricing, about, contact) are ONLY accessible to VISITOR
 * - Auth routes (login, register, etc.) are ONLY accessible to VISITOR
 * - Once authenticated, users are redirected to their appropriate destination
 */
export const ROUTE_ALLOWED_STATES: Record<string, UserState[]> = {
  // Public routes - accessible ONLY to VISITOR (unauthenticated users)
  // Authenticated users are redirected to their appropriate destination
  [ROUTES.HOME]: ["VISITOR", "APP_READY"],
  [ROUTES.PRICING]: ["VISITOR", "APP_READY"],
  [ROUTES.CONTACT]: ["VISITOR", "APP_READY"],
  "/error": ["VISITOR", "AUTHENTICATED", "ACTIVATED", "ONBOARDING.profile", "ONBOARDING.interests", "APP_READY"], // Error page accessible to all

  // Auth routes - accessible ONLY to VISITOR (unauthenticated users)
  // Authenticated users are redirected to their appropriate destination
  [ROUTES.AUTH.LOGIN]: ["VISITOR"],
  [ROUTES.AUTH.REGISTER]: ["VISITOR"],
  [ROUTES.AUTH.FORGOT_PASSWORD]: ["VISITOR"],
  [ROUTES.AUTH.RESET_PASSWORD]: ["VISITOR"],
  [ROUTES.AUTH.ACTIVATE]: ["VISITOR"], // Activation can be accessed via email link even if not logged in
  
  // Post-login route - accessible to authenticated users
  // Components will handle routing based on API calls
  [POST_LOGIN_ROUTE]: ["AUTHENTICATED"],

  // Activation routes - accessible to authenticated users
  [ROUTES.ONBOARDING.ACTIVATION_REQUIRED]: ["AUTHENTICATED"],

  // Onboarding routes - accessible to authenticated users
  // Components will handle access control based on API calls
  [ROUTES.ONBOARDING.ROOT]: ["AUTHENTICATED"],
  [ROUTES.ONBOARDING.START]: ["AUTHENTICATED"],
  [ROUTES.ONBOARDING.PROFILE]: ["AUTHENTICATED"],
  [ROUTES.ONBOARDING.INTERESTS]: ["AUTHENTICATED"],
  [ROUTES.ONBOARDING.DONE]: ["AUTHENTICATED"],

  // App routes - accessible to authenticated users
  // Components will handle access control based on API calls
  [ROUTES.APP.DASHBOARD]: ["AUTHENTICATED"],
  [ROUTES.APP.USER]: ["AUTHENTICATED"],
};

/**
 * Check if a user state can access a route
 * 
 * Deterministic function: same inputs → same output
 */
export function canAccessRoute(userState: UserState, route: string): boolean {
  // Check exact match first
  if (ROUTE_ALLOWED_STATES[route]) {
    return ROUTE_ALLOWED_STATES[route].includes(userState);
  }

  // Check route patterns (starts with)
  // Post-login is accessible to authenticated users
  if (route === ROUTES.AUTH.POST_LOGIN) {
    return userState === "AUTHENTICATED";
  }
  
  // Auth routes - ONLY accessible to VISITOR (unauthenticated)
  if (route.startsWith("/auth/")) {
    return userState === "VISITOR";
  }

  // Onboarding and app routes - accessible to authenticated users
  // Components will handle access control based on API calls
  if (route.startsWith("/onboarding/") || route.startsWith("/app") || route.startsWith("/user")) {
    return userState === "AUTHENTICATED";
  }

  // Default: allow (for public routes not explicitly listed)
  return true;
}

/**
 * Get the correct redirect route for a user state
 * 
 * Deterministic function: same state → same route
 */
export function getRedirectRouteForState(userState: UserState): string {
  switch (userState) {
    case "VISITOR":
      // Visitors trying to access protected routes → login
      return ROUTES.AUTH.LOGIN;
    case "AUTHENTICATED":
      // Authenticated → post-login (components will handle routing based on API calls)
      return ROUTES.AUTH.POST_LOGIN;
    default:
      // Fallback → login
      return ROUTES.AUTH.LOGIN;
  }
}

/**
 * Get redirect route for post-login page
 * 
 * Post-login page will fetch user state via API and redirect client-side
 * Middleware just allows access - no redirect needed
 */
export function getPostLoginRedirect(): string {
  // Post-login page handles its own redirects via API calls
  // Middleware just allows access (no redirect loop)
  return ROUTES.AUTH.POST_LOGIN;
}

/**
 * Determine if a route requires authentication
 * 
 * Note: Public routes and auth routes are "protected" in the sense that
 * authenticated users are redirected away from them.
 */
export function isProtectedRoute(route: string): boolean {
  // Error page is always accessible
  if (route === "/error") {
    return false;
  }

  // All routes (including public and auth) are processed by middleware
  // to enforce redirects for authenticated users
  // Post-login route is protected (requires auth to determine redirect)
  if (route === ROUTES.AUTH.POST_LOGIN) {
    return true;
  }

  // All routes are processed by middleware
  // Public routes and auth routes will redirect authenticated users
  return true;
}
