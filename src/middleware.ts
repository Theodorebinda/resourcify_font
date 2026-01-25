/**
 * Next.js Middleware - Access Control ONLY
 * Phase 1: Minimal access control logic
 * 
 * Responsibilities:
 * - Detect authentication state via cookies
 * - Detect account activation state
 * - Detect onboarding completion state
 * - Redirect accordingly
 * 
 * IMPORTANT:
 * - Middleware decides ACCESS, not UX
 * - No API fetching inside middleware
 * - No UI logic in middleware
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuthCookie } from "./utils/cookies";
import { ROUTES } from "./constants/routes";

export async function middleware(request: NextRequest) {
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
  ];

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Get auth state from cookies
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
    if (pathname.startsWith("/app") || pathname !== ROUTES.ONBOARDING.ACTIVATION_REQUIRED) {
      return NextResponse.redirect(
        new URL(ROUTES.ONBOARDING.ACTIVATION_REQUIRED, request.url)
      );
    }
  }

  // Activated but onboarding incomplete
  if (authCookie.activated && !authCookie.onboardingCompleted) {
    const onboardingRoutes = Object.values(ROUTES.ONBOARDING);
    
    // Allow access to onboarding routes
    if (onboardingRoutes.includes(pathname as typeof onboardingRoutes[number])) {
      return NextResponse.next();
    }
    
    // Redirect to onboarding if trying to access app
    if (pathname.startsWith("/app")) {
      return NextResponse.redirect(
        new URL(ROUTES.ONBOARDING.PROFILE, request.url)
      );
    }
  }

  // Fully onboarded users - allow access to app
  if (authCookie.activated && authCookie.onboardingCompleted) {
    // Redirect onboarding routes to app
    if (pathname.startsWith("/onboarding")) {
      return NextResponse.redirect(new URL(ROUTES.APP.DASHBOARD, request.url));
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
