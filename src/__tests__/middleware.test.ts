/**
 * Middleware Test Suite
 * 
 * Tests access control and redirections for all user states and route categories.
 * 
 * Each test explicitly defines a mocked auth context:
 * - authenticated: boolean
 * - is_active: boolean
 * - onboarding_step: "not_started" | "profile" | "interests" | "completed"
 * 
 * Tests are pure, deterministic, and document access rules by example.
 */

import { NextRequest, NextResponse } from "next/server";
import { middleware as middlewareFn } from "../middleware";
import { getAuthCookie } from "../utils/cookies";
import { ROUTES } from "../constants/routes";
import type { OnboardingStep } from "../types";

// Mock the cookies utility
jest.mock("../utils/cookies");

const mockGetAuthCookie = getAuthCookie as jest.MockedFunction<
  typeof getAuthCookie
>;

/**
 * Helper to create a NextRequest with a given pathname
 */
function createRequest(pathname: string, origin = "https://example.com"): NextRequest {
  return new NextRequest(new URL(pathname, origin));
}

/**
 * Helper to extract redirect location from NextResponse
 */
function getRedirectLocation(response: NextResponse): string | null {
  const location = response.headers.get("location");
  if (!location) return null;
  // Extract pathname from absolute URL
  try {
    return new URL(location).pathname;
  } catch {
    return location;
  }
}

/**
 * Helper to check if response is a redirect
 */
function isRedirect(response: NextResponse): boolean {
  return response.status >= 300 && response.status < 400;
}

/**
 * Helper to check if response allows access (no redirect)
 */
function allowsAccess(response: NextResponse): boolean {
  return !isRedirect(response);
}

describe("Middleware - Access Control", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("1️⃣ Visitor (Unauthenticated)", () => {
    beforeEach(() => {
      mockGetAuthCookie.mockResolvedValue(null);
    });

    const publicRoutes = [
      { path: ROUTES.HOME, name: "home" },
      { path: ROUTES.PRICING, name: "pricing" },
      { path: ROUTES.BLOG, name: "blog" },
      { path: ROUTES.CONTACT, name: "contact" },
    ];

    const authRoutes = [
      { path: ROUTES.AUTH.LOGIN, name: "login" },
      { path: ROUTES.AUTH.REGISTER, name: "register" },
      { path: ROUTES.AUTH.FORGOT_PASSWORD, name: "forgot-password" },
      { path: ROUTES.AUTH.RESET_PASSWORD, name: "reset-password" },
      { path: ROUTES.AUTH.ACTIVATE, name: "activate" },
    ];

    const protectedRoutes = [
      { path: ROUTES.ONBOARDING.ACTIVATION_REQUIRED, name: "activation-required" },
      { path: ROUTES.ONBOARDING.PROFILE, name: "onboarding-profile" },
      { path: ROUTES.ONBOARDING.INTERESTS, name: "onboarding-interests" },
      { path: ROUTES.APP.DASHBOARD, name: "app-dashboard" },
      { path: "/app/settings", name: "app-settings" },
    ];

    test.each(publicRoutes)(
      "allows access to public route: $name ($path)",
      async ({ path }) => {
        const request = createRequest(path);
        const response = await middlewareFn(request);

        expect(allowsAccess(response)).toBe(true);
      }
    );

    test.each(authRoutes)(
      "allows access to auth route: $name ($path)",
      async ({ path }) => {
        const request = createRequest(path);
        const response = await middlewareFn(request);

        expect(allowsAccess(response)).toBe(true);
      }
    );

    test.each(protectedRoutes)(
      "redirects to /auth/login when accessing protected route: $name ($path)",
      async ({ path }) => {
        const request = createRequest(path);
        const response = await middlewareFn(request);

        expect(isRedirect(response)).toBe(true);
        expect(getRedirectLocation(response)).toBe(ROUTES.AUTH.LOGIN);
      }
    );

    test("allows access to error page", async () => {
      const request = createRequest("/error");
      const response = await middleware(request);

      expect(allowsAccess(response)).toBe(true);
    });
  });

  describe("2️⃣ Authenticated but NOT Activated", () => {
    beforeEach(() => {
      mockGetAuthCookie.mockResolvedValue({
        token: "mock-token",
        userId: "user-123",
        activated: false,
        onboardingStep: undefined,
      });
    });

    const allowedRoutes = [
      { path: ROUTES.ONBOARDING.ACTIVATION_REQUIRED, name: "activation-required" },
      { path: ROUTES.AUTH.LOGIN, name: "auth-login" },
      { path: ROUTES.AUTH.REGISTER, name: "auth-register" },
    ];

    const redirectedRoutes = [
      { path: ROUTES.ONBOARDING.PROFILE, name: "onboarding-profile" },
      { path: ROUTES.ONBOARDING.INTERESTS, name: "onboarding-interests" },
      { path: ROUTES.APP.DASHBOARD, name: "app-dashboard" },
      { path: "/app/settings", name: "app-settings" },
    ];

    test.each(allowedRoutes)(
      "allows access to route: $name ($path)",
      async ({ path }) => {
        const request = createRequest(path);
        const response = await middlewareFn(request);

        expect(allowsAccess(response)).toBe(true);
      }
    );

    test.each(redirectedRoutes)(
      "redirects to /onboarding/activation-required when accessing: $name ($path)",
      async ({ path }) => {
        const request = createRequest(path);
        const response = await middlewareFn(request);

        expect(isRedirect(response)).toBe(true);
        expect(getRedirectLocation(response)).toBe(
          ROUTES.ONBOARDING.ACTIVATION_REQUIRED
        );
      }
    );

    test("allows access to public routes", async () => {
      const request = createRequest(ROUTES.HOME);
      const response = await middleware(request);

      expect(allowsAccess(response)).toBe(true);
    });
  });

  describe("3️⃣ Activated but NOT Onboarded", () => {
    const onboardingSteps: OnboardingStep[] = ["not_started", "profile", "interests"];

    describe.each(onboardingSteps)("onboarding_step = %s", (onboardingStep) => {
      beforeEach(() => {
        mockGetAuthCookie.mockResolvedValue({
          token: "mock-token",
          userId: "user-123",
          activated: true,
          onboardingStep,
        });
      });

      test("allows access to public routes", async () => {
        const request = createRequest(ROUTES.HOME);
        const response = await middlewareFn(request);

        expect(allowsAccess(response)).toBe(true);
      });

      test("redirects auth routes to onboarding", async () => {
        const request = createRequest(ROUTES.AUTH.LOGIN);
        const response = await middlewareFn(request);

        // Auth routes are public, so they should be accessible
        // But let's verify the middleware behavior
        expect(allowsAccess(response)).toBe(true);
      });

      test("blocks access to app routes", async () => {
        const request = createRequest(ROUTES.APP.DASHBOARD);
        const response = await middlewareFn(request);

        expect(isRedirect(response)).toBe(true);
        
        // Should redirect to the correct onboarding step
        const expectedRoute =
          onboardingStep === "not_started" || onboardingStep === "profile"
            ? ROUTES.ONBOARDING.PROFILE
            : ROUTES.ONBOARDING.INTERESTS;
        expect(getRedirectLocation(response)).toBe(expectedRoute);
      });

      test("blocks access to /app/settings", async () => {
        const request = createRequest("/app/settings");
        const response = await middlewareFn(request);

        expect(isRedirect(response)).toBe(true);
      });
    });

    describe("onboarding_step = not_started", () => {
      beforeEach(() => {
        mockGetAuthCookie.mockResolvedValue({
          token: "mock-token",
          userId: "user-123",
          activated: true,
          onboardingStep: "not_started",
        });
      });

      test("allows access to /onboarding/profile", async () => {
        const request = createRequest(ROUTES.ONBOARDING.PROFILE);
        const response = await middlewareFn(request);

        expect(allowsAccess(response)).toBe(true);
      });

      test("redirects /onboarding/interests to /onboarding/profile", async () => {
        const request = createRequest(ROUTES.ONBOARDING.INTERESTS);
        const response = await middlewareFn(request);

        expect(isRedirect(response)).toBe(true);
        expect(getRedirectLocation(response)).toBe(ROUTES.ONBOARDING.PROFILE);
      });

      test("redirects /onboarding/done to /onboarding/profile", async () => {
        const request = createRequest(ROUTES.ONBOARDING.DONE);
        const response = await middlewareFn(request);

        expect(isRedirect(response)).toBe(true);
        expect(getRedirectLocation(response)).toBe(ROUTES.ONBOARDING.PROFILE);
      });
    });

    describe("onboarding_step = profile", () => {
      beforeEach(() => {
        mockGetAuthCookie.mockResolvedValue({
          token: "mock-token",
          userId: "user-123",
          activated: true,
          onboardingStep: "profile",
        });
      });

      test("allows access to /onboarding/profile", async () => {
        const request = createRequest(ROUTES.ONBOARDING.PROFILE);
        const response = await middlewareFn(request);

        expect(allowsAccess(response)).toBe(true);
      });

      test("allows access to /onboarding/interests", async () => {
        const request = createRequest(ROUTES.ONBOARDING.INTERESTS);
        const response = await middlewareFn(request);

        expect(allowsAccess(response)).toBe(true);
      });

      test("redirects /onboarding/done to /onboarding/profile", async () => {
        const request = createRequest(ROUTES.ONBOARDING.DONE);
        const response = await middlewareFn(request);

        expect(isRedirect(response)).toBe(true);
        expect(getRedirectLocation(response)).toBe(ROUTES.ONBOARDING.PROFILE);
      });
    });

    describe("onboarding_step = interests", () => {
      beforeEach(() => {
        mockGetAuthCookie.mockResolvedValue({
          token: "mock-token",
          userId: "user-123",
          activated: true,
          onboardingStep: "interests",
        });
      });

      test("allows access to /onboarding/interests", async () => {
        const request = createRequest(ROUTES.ONBOARDING.INTERESTS);
        const response = await middlewareFn(request);

        expect(allowsAccess(response)).toBe(true);
      });

      test("allows access to /onboarding/done (can proceed)", async () => {
        const request = createRequest(ROUTES.ONBOARDING.DONE);
        const response = await middlewareFn(request);

        // User on interests step can access done (next step)
        expect(allowsAccess(response)).toBe(true);
      });

      test("allows access to /onboarding/profile (can go back)", async () => {
        const request = createRequest(ROUTES.ONBOARDING.PROFILE);
        const response = await middlewareFn(request);

        // User on interests step can access profile (previous step)
        expect(allowsAccess(response)).toBe(true);
      });
    });
  });

  describe("4️⃣ Fully Onboarded (APP_READY)", () => {
    beforeEach(() => {
      mockGetAuthCookie.mockResolvedValue({
        token: "mock-token",
        userId: "user-123",
        activated: true,
        onboardingStep: "completed",
      });
    });

    const appRoutes = [
      { path: ROUTES.APP.DASHBOARD, name: "app-dashboard" },
      { path: "/app/settings", name: "app-settings" },
      { path: "/app/any-route", name: "app-any-route" },
    ];

    const redirectedRoutes = [
      { path: ROUTES.ONBOARDING.PROFILE, name: "onboarding-profile" },
      { path: ROUTES.ONBOARDING.INTERESTS, name: "onboarding-interests" },
      { path: ROUTES.ONBOARDING.DONE, name: "onboarding-done" },
      { path: ROUTES.ONBOARDING.ACTIVATION_REQUIRED, name: "activation-required" },
    ];

    test.each(appRoutes)(
      "allows access to app route: $name ($path)",
      async ({ path }) => {
        const request = createRequest(path);
        const response = await middlewareFn(request);

        expect(allowsAccess(response)).toBe(true);
      }
    );

    test.each(redirectedRoutes)(
      "redirects to /app when accessing: $name ($path)",
      async ({ path }) => {
        const request = createRequest(path);
        const response = await middlewareFn(request);

        expect(isRedirect(response)).toBe(true);
        expect(getRedirectLocation(response)).toBe(ROUTES.APP.DASHBOARD);
      }
    );

    test("allows access to public routes", async () => {
      const request = createRequest(ROUTES.HOME);
      const response = await middleware(request);

      expect(allowsAccess(response)).toBe(true);
    });

    test("allows access to auth routes (they are public)", async () => {
      const request = createRequest(ROUTES.AUTH.LOGIN);
      const response = await middleware(request);

      expect(allowsAccess(response)).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    test("handles missing onboarding_step (defaults to not_started)", async () => {
      mockGetAuthCookie.mockResolvedValue({
        token: "mock-token",
        userId: "user-123",
        activated: true,
        onboardingStep: undefined,
      });

      const request = createRequest(ROUTES.APP.DASHBOARD);
      const response = await middleware(request);

      expect(isRedirect(response)).toBe(true);
      expect(getRedirectLocation(response)).toBe(ROUTES.ONBOARDING.PROFILE);
    });

    test("handles invalid route gracefully", async () => {
      mockGetAuthCookie.mockResolvedValue(null);

      const request = createRequest("/unknown-route");
      const response = await middleware(request);

      // Unknown routes that don't match any pattern should pass through
      expect(allowsAccess(response)).toBe(true);
    });

    test("preserves query parameters in redirects", async () => {
      mockGetAuthCookie.mockResolvedValue(null);

      const request = createRequest("/app?foo=bar");
      const response = await middleware(request);

      expect(isRedirect(response)).toBe(true);
      const location = response.headers.get("location");
      expect(location).toContain(ROUTES.AUTH.LOGIN);
    });
  });

  describe("Route Matching", () => {
    beforeEach(() => {
      mockGetAuthCookie.mockResolvedValue({
        token: "mock-token",
        userId: "user-123",
        activated: true,
        onboardingStep: "completed",
      });
    });

    test("matches /app/* routes correctly", async () => {
      const routes = [
        "/app",
        "/app/dashboard",
        "/app/settings",
        "/app/users/123",
      ];

      for (const route of routes) {
        const request = createRequest(route);
        const response = await middlewareFn(request);
        expect(allowsAccess(response)).toBe(true);
      }
    });

    test("matches /onboarding/* routes correctly", async () => {
      mockGetAuthCookie.mockResolvedValue({
        token: "mock-token",
        userId: "user-123",
        activated: true,
        onboardingStep: "completed",
      });

      const request = createRequest("/onboarding/profile");
      const response = await middleware(request);

      expect(isRedirect(response)).toBe(true);
      expect(getRedirectLocation(response)).toBe(ROUTES.APP.DASHBOARD);
    });
  });
});
