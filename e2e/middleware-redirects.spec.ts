/**
 * E2E Tests - Middleware Redirects
 * 
 * Validates middleware redirect behavior for all user states.
 * 
 * Focus: Explicit URL checks and redirect assertions.
 */

import { test, expect } from "@playwright/test";
import {
  registerTestUser,
  loginTestUser,
  clearAuthState,
  generateTestUserEmail,
  generateTestUsername,
  type TestUser,
} from "./helpers/auth-helpers";
import {
  navigateToRoute,
  expectCurrentRoute,
  expectRouteBlocked,
  expectRouteAccessible,
  TEST_ROUTES,
} from "./helpers/route-helpers";

test.describe("Middleware Redirects - Deterministic Behavior", () => {
  let testUser: TestUser;

  test.beforeEach(async ({ page }) => {
    testUser = {
      email: generateTestUserEmail(),
      password: "TestPassword123!",
      username: generateTestUsername(),
    };
    await clearAuthState(page);
  });

  test.describe("VISITOR State", () => {
    test("VISITOR accessing /app → redirected to /auth/login", async ({
      page,
    }) => {
      await navigateToRoute(page, TEST_ROUTES.DASHBOARD);
      await expectCurrentRoute(page, TEST_ROUTES.LOGIN);
    });

    test("VISITOR accessing /onboarding/profile → redirected to /auth/login", async ({
      page,
    }) => {
      await navigateToRoute(page, TEST_ROUTES.ONBOARDING_PROFILE);
      await expectCurrentRoute(page, TEST_ROUTES.LOGIN);
    });

    test("VISITOR accessing /onboarding/interests → redirected to /auth/login", async ({
      page,
    }) => {
      await navigateToRoute(page, TEST_ROUTES.ONBOARDING_INTERESTS);
      await expectCurrentRoute(page, TEST_ROUTES.LOGIN);
    });

    test("VISITOR accessing /onboarding/activation-required → redirected to /auth/login", async ({
      page,
    }) => {
      await navigateToRoute(page, TEST_ROUTES.ACTIVATION_REQUIRED);
      await expectCurrentRoute(page, TEST_ROUTES.LOGIN);
    });

    test("VISITOR can access public routes", async ({ page }) => {
      await expectRouteAccessible(page, TEST_ROUTES.HOME);
      await expectRouteAccessible(page, "/pricing");
      await expectRouteAccessible(page, "/about");
      await expectRouteAccessible(page, "/contact");
    });

    test("VISITOR can access auth routes", async ({ page }) => {
      await expectRouteAccessible(page, TEST_ROUTES.LOGIN);
      await expectRouteAccessible(page, TEST_ROUTES.REGISTER);
    });
  });

  test.describe("AUTHENTICATED State (Not Activated)", () => {
    test.beforeEach(async ({ page }) => {
      await registerTestUser(page, testUser);
      await loginTestUser(page, testUser.email, testUser.password);
    });

    test("AUTHENTICATED accessing /app → redirected to /onboarding/activation-required", async ({
      page,
    }) => {
      await navigateToRoute(page, TEST_ROUTES.DASHBOARD);
      await expectCurrentRoute(page, TEST_ROUTES.ACTIVATION_REQUIRED);
    });

    test("AUTHENTICATED accessing /onboarding/profile → redirected to /onboarding/activation-required", async ({
      page,
    }) => {
      await navigateToRoute(page, TEST_ROUTES.ONBOARDING_PROFILE);
      await expectCurrentRoute(page, TEST_ROUTES.ACTIVATION_REQUIRED);
    });

    test("AUTHENTICATED accessing /onboarding/interests → redirected to /onboarding/activation-required", async ({
      page,
    }) => {
      await navigateToRoute(page, TEST_ROUTES.ONBOARDING_INTERESTS);
      await expectCurrentRoute(page, TEST_ROUTES.ACTIVATION_REQUIRED);
    });

    test("AUTHENTICATED can access /onboarding/activation-required", async ({
      page,
    }) => {
      await expectRouteAccessible(page, TEST_ROUTES.ACTIVATION_REQUIRED);
    });

    test("AUTHENTICATED can access auth routes", async ({ page }) => {
      await expectRouteAccessible(page, TEST_ROUTES.LOGIN);
      await expectRouteAccessible(page, TEST_ROUTES.REGISTER);
    });

    test("AUTHENTICATED can access public routes", async ({ page }) => {
      await expectRouteAccessible(page, TEST_ROUTES.HOME);
      await expectRouteAccessible(page, "/pricing");
    });
  });

  test.describe("ACTIVATED State (Not Onboarded)", () => {
    test("ACTIVATED accessing /onboarding/interests → redirected to /onboarding/profile", async ({
      page,
    }) => {
      // This requires backend test setup to create user in ACTIVATED state
      test.skip("Requires backend test setup for ACTIVATED state");
    });

    test("ACTIVATED accessing /app → redirected to /onboarding/profile", async ({
      page,
    }) => {
      test.skip("Requires backend test setup for ACTIVATED state");
    });

    test("ACTIVATED can access /onboarding/profile", async ({ page }) => {
      test.skip("Requires backend test setup for ACTIVATED state");
    });
  });

  test.describe("ONBOARDING.profile State", () => {
    test("ONBOARDING.profile accessing /app → redirected to /onboarding/profile", async ({
      page,
    }) => {
      test.skip("Requires backend test setup for ONBOARDING.profile state");
    });

    test("ONBOARDING.profile can access /onboarding/profile", async ({
      page,
    }) => {
      test.skip("Requires backend test setup for ONBOARDING.profile state");
    });

    test("ONBOARDING.profile can access /onboarding/interests", async ({
      page,
    }) => {
      test.skip("Requires backend test setup for ONBOARDING.profile state");
    });
  });

  test.describe("ONBOARDING.interests State", () => {
    test("ONBOARDING.interests accessing /app → redirected to /onboarding/interests", async ({
      page,
    }) => {
      test.skip("Requires backend test setup for ONBOARDING.interests state");
    });

    test("ONBOARDING.interests can access /onboarding/interests", async ({
      page,
    }) => {
      test.skip("Requires backend test setup for ONBOARDING.interests state");
    });
  });

  test.describe("APP_READY State", () => {
    test("APP_READY accessing /onboarding/profile → redirected to /app", async ({
      page,
    }) => {
      test.skip("Requires backend test setup for APP_READY state");
    });

    test("APP_READY can access /app", async ({ page }) => {
      test.skip("Requires backend test setup for APP_READY state");
    });

    test("APP_READY accessing /onboarding/interests → redirected to /app", async ({
      page,
    }) => {
      test.skip("Requires backend test setup for APP_READY state");
    });
  });
});
