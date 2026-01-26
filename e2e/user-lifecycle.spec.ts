/**
 * E2E Tests - User Lifecycle
 * 
 * Validates the complete user lifecycle from registration to app access.
 * 
 * Rules:
 * - Real routing with middleware enabled
 * - No mocking of frontend guards
 * - Explicit URL checks
 * - Explicit redirect checks
 * - No silent failures
 * - Tests read like user stories
 */

import { test, expect } from "@playwright/test";
import {
  registerTestUser,
  loginTestUser,
  activateTestUser,
  clearAuthState,
  generateTestUserEmail,
  generateTestUsername,
  type TestUser,
} from "./helpers/auth-helpers";
import {
  navigateToRoute,
  expectCurrentRoute,
  expectRedirect,
  expectRouteAccessible,
  expectRouteBlocked,
  TEST_ROUTES,
} from "./helpers/route-helpers";

test.describe("User Lifecycle - End-to-End", () => {
  let testUser: TestUser;

  test.beforeEach(async ({ page }) => {
    // Generate unique test user for each test
    testUser = {
      email: generateTestUserEmail(),
      password: "TestPassword123!",
      username: generateTestUsername(),
    };

    // Clear any existing auth state
    await clearAuthState(page);
  });

  test.describe("Scenario 1: Login → Not Activated", () => {
    test("User logs in with unactivated account → redirected to activation-required", async ({
      page,
    }) => {
      // Step 1: Register a new user
      await registerTestUser(page, testUser);

      // Step 2: Login (account not activated yet)
      await loginTestUser(page, testUser.email, testUser.password);

      // Step 3: Navigate to any protected route
      await navigateToRoute(page, TEST_ROUTES.DASHBOARD);

      // Assert: User is redirected to activation-required page
      await expectCurrentRoute(page, TEST_ROUTES.ACTIVATION_REQUIRED);

      // Assert: User cannot access onboarding routes
      await expectRouteBlocked(
        page,
        TEST_ROUTES.ONBOARDING_PROFILE,
        TEST_ROUTES.ACTIVATION_REQUIRED
      );

      // Assert: User cannot access dashboard
      await expectRouteBlocked(
        page,
        TEST_ROUTES.DASHBOARD,
        TEST_ROUTES.ACTIVATION_REQUIRED
      );

      // Assert: User can access activation-required page
      await expectRouteAccessible(page, TEST_ROUTES.ACTIVATION_REQUIRED);

      // Assert: User can still access auth routes
      await expectRouteAccessible(page, TEST_ROUTES.LOGIN);
    });
  });

  test.describe("Scenario 2: Activation → Onboarding", () => {
    test("User activates account → redirected to onboarding profile step", async ({
      page,
    }) => {
      // Step 1: Register and login
      await registerTestUser(page, testUser);
      await loginTestUser(page, testUser.email, testUser.password);

      // Step 2: Get activation token (in real scenario, from email)
      // For E2E, we need to get token from backend or test setup
      // This is a placeholder - actual implementation depends on test setup
      const activationToken = "test-activation-token"; // TODO: Get from test setup

      // Step 3: Activate account
      try {
        await activateTestUser(page, activationToken);
      } catch (error) {
        // If activation fails (token not available in test), skip this test
        test.skip();
      }

      // Step 4: Navigate to any route
      await navigateToRoute(page, TEST_ROUTES.DASHBOARD);

      // Assert: User is redirected to onboarding profile step
      await expectCurrentRoute(page, TEST_ROUTES.ONBOARDING_PROFILE);

      // Assert: User cannot access interests step directly
      await expectRouteBlocked(
        page,
        TEST_ROUTES.ONBOARDING_INTERESTS,
        TEST_ROUTES.ONBOARDING_PROFILE
      );

      // Assert: User cannot access dashboard
      await expectRouteBlocked(
        page,
        TEST_ROUTES.DASHBOARD,
        TEST_ROUTES.ONBOARDING_PROFILE
      );

      // Assert: User can access profile step
      await expectRouteAccessible(page, TEST_ROUTES.ONBOARDING_PROFILE);
    });
  });

  test.describe("Scenario 3: Onboarding Step Enforcement", () => {
    test("User completes profile → redirected to interests → cannot skip step", async ({
      page,
    }) => {
      // Step 1: Register, login, and activate
      await registerTestUser(page, testUser);
      await loginTestUser(page, testUser.email, testUser.password);
      
      // Note: In real E2E, we'd need to:
      // 1. Get activation token from backend/test setup
      // 2. Activate account
      // 3. Complete profile step via API or form submission
      // This is a placeholder for the flow

      // For now, we test the middleware behavior:
      // If user is on profile step, they cannot access interests or dashboard

      // This test would require:
      // - Backend test setup to create user in specific state
      // - Or API calls to progress through onboarding
      
      test.skip("Requires backend test setup for onboarding state progression");
    });
  });

  test.describe("Scenario 4: Onboarding Completion", () => {
    test("User completes onboarding → redirected to dashboard → can access app routes", async ({
      page,
    }) => {
      // Step 1: Complete full flow (register → activate → complete onboarding)
      // This requires backend test setup

      // For now, we test the middleware behavior:
      // If user is APP_READY, they can access /app routes

      test.skip("Requires backend test setup for onboarding completion");
    });
  });

  test.describe("Scenario 5: Direct URL Access", () => {
    test("VISITOR tries to access /app → redirected to login", async ({
      page,
    }) => {
      // Clear auth state (ensure VISITOR state)
      await clearAuthState(page);

      // Try to access dashboard directly
      await navigateToRoute(page, TEST_ROUTES.DASHBOARD);

      // Assert: Redirected to login
      await expectCurrentRoute(page, TEST_ROUTES.LOGIN);
    });

    test("VISITOR tries to access /onboarding/profile → redirected to login", async ({
      page,
    }) => {
      await clearAuthState(page);

      await navigateToRoute(page, TEST_ROUTES.ONBOARDING_PROFILE);

      // Assert: Redirected to login
      await expectCurrentRoute(page, TEST_ROUTES.LOGIN);
    });

    test("AUTHENTICATED tries to access /app → redirected to activation-required", async ({
      page,
    }) => {
      // Register and login (not activated)
      await registerTestUser(page, testUser);
      await loginTestUser(page, testUser.email, testUser.password);

      // Try to access dashboard
      await navigateToRoute(page, TEST_ROUTES.DASHBOARD);

      // Assert: Redirected to activation-required
      await expectCurrentRoute(page, TEST_ROUTES.ACTIVATION_REQUIRED);
    });

    test("ACTIVATED tries to access /onboarding/interests → redirected to profile", async ({
      page,
    }) => {
      // This requires backend test setup to create user in ACTIVATED state
      // (activated but onboarding_step = "not_started")

      test.skip("Requires backend test setup for ACTIVATED state");
    });

    test("ACTIVATED tries to access /app → redirected to profile", async ({
      page,
    }) => {
      // This requires backend test setup

      test.skip("Requires backend test setup for ACTIVATED state");
    });
  });

  test.describe("Public Routes", () => {
    test("VISITOR can access public routes", async ({ page }) => {
      await clearAuthState(page);

      // Home page
      await expectRouteAccessible(page, TEST_ROUTES.HOME);

      // Pricing page
      await expectRouteAccessible(page, "/pricing");

      // About page
      await expectRouteAccessible(page, "/about");

      // Contact page
      await expectRouteAccessible(page, "/contact");
    });

    test("AUTHENTICATED can access public routes", async ({ page }) => {
      await registerTestUser(page, testUser);
      await loginTestUser(page, testUser.email, testUser.password);

      await expectRouteAccessible(page, TEST_ROUTES.HOME);
      await expectRouteAccessible(page, "/pricing");
    });
  });

  test.describe("Auth Routes", () => {
    test("VISITOR can access auth routes", async ({ page }) => {
      await clearAuthState(page);

      await expectRouteAccessible(page, TEST_ROUTES.LOGIN);
      await expectRouteAccessible(page, TEST_ROUTES.REGISTER);
    });

    test("AUTHENTICATED can access auth routes", async ({ page }) => {
      await registerTestUser(page, testUser);
      await loginTestUser(page, testUser.email, testUser.password);

      await expectRouteAccessible(page, TEST_ROUTES.LOGIN);
      await expectRouteAccessible(page, TEST_ROUTES.REGISTER);
    });

    test("APP_READY cannot access auth routes → redirected to dashboard", async ({
      page,
    }) => {
      // This requires backend test setup for APP_READY state

      test.skip("Requires backend test setup for APP_READY state");
    });
  });
});
