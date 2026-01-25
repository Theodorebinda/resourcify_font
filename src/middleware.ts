/**
 * Next.js Middleware - Access Control ONLY
 * 
 * Responsibilities:
 * - Read minimal auth payload: authenticated?, is_active?, onboarding_step?
 * - Enforce correct onboarding step order
 * - Block access to future onboarding steps
 * - Block access to /app before onboarding is completed
 * - Redirect to the correct step
 * 
 * IMPORTANT:
 * - Middleware decides ACCESS, not UX
 * - No API fetching inside middleware
 * - No UI logic in middleware
 * - No guessing or client-side fixes
 * - Redirects must be deterministic and testable
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuthCookie } from "./utils/cookies";
import { ROUTES } from "./constants/routes";
import {
  getRouteForStep,
  canAccessRoute,
} from "./utils/onboarding-routes";

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Public routes - no access control
  const publicRoutes = [
    ROUTES.HOME,
    ROUTES.PRICING,
    ROUTES.ABOUT,
    ROUTES.CONTACT,
    ROUTES.AUTH.LOGIN,
    ROUTES.AUTH.REGISTER,
    ROUTES.AUTH.FORGOT_PASSWORD,
    ROUTES.AUTH.RESET_PASSWORD,
    ROUTES.AUTH.ACTIVATE,
    "/error", // Error page must be accessible
  ];

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Get auth state from cookies (minimal payload)
  const authCookie = await getAuthCookie();

  // Unauthenticated users trying to access protected routes
  if (!authCookie) {
    if (pathname.startsWith("/app") || pathname.startsWith("/onboarding")) {
      return NextResponse.redirect(new URL(ROUTES.AUTH.LOGIN, request.url));
    }
    return NextResponse.next();
  }

  // Authenticated but NOT activated
  if (!authCookie.activated) {
    // Allow access to activation-required page and auth routes
    if (
      pathname === ROUTES.ONBOARDING.ACTIVATION_REQUIRED ||
      pathname.startsWith("/auth/")
    ) {
      return NextResponse.next();
    }
    // Redirect to activation required
    if (pathname.startsWith("/app") || pathname.startsWith("/onboarding")) {
      return NextResponse.redirect(
        new URL(ROUTES.ONBOARDING.ACTIVATION_REQUIRED, request.url)
      );
    }
    return NextResponse.next();
  }

  // Activated - check onboarding step
  const onboardingStep = authCookie.onboardingStep || "not_started";

  // If onboarding is completed, allow access to app
  if (onboardingStep === "completed") {
    // Redirect onboarding routes to app
    if (pathname.startsWith("/onboarding")) {
      return NextResponse.redirect(new URL(ROUTES.APP.DASHBOARD, request.url));
    }
    // Allow access to app routes
    if (pathname.startsWith("/app")) {
      return NextResponse.next();
    }
    return NextResponse.next();
  }

  // Onboarding in progress - enforce step order
  if (pathname.startsWith("/app")) {
    // Block access to app before onboarding is completed
    const correctRoute = getRouteForStep(onboardingStep);
    return NextResponse.redirect(new URL(correctRoute, request.url));
  }

  if (pathname.startsWith("/onboarding")) {
    // Check if user can access this onboarding route
    if (!canAccessRoute(onboardingStep, pathname)) {
      // Redirect to the correct step
      const correctRoute = getRouteForStep(onboardingStep);
      return NextResponse.redirect(new URL(correctRoute, request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
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
