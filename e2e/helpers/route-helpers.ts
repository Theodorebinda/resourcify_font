/**
 * E2E Test Helpers - Route Navigation
 * 
 * Helper functions for navigating and asserting routes.
 */

import { Page, expect } from "@playwright/test";
import { ROUTES } from "../../src/constants/routes";

/**
 * Navigate to a route and wait for it to load
 */
export async function navigateToRoute(page: Page, route: string): Promise<void> {
  await page.goto(route);
  await page.waitForLoadState("networkidle");
}

/**
 * Assert that the current URL matches the expected route
 */
export async function expectCurrentRoute(
  page: Page,
  expectedRoute: string
): Promise<void> {
  const url = new URL(page.url());
  expect(url.pathname).toBe(expectedRoute);
}

/**
 * Assert that the user was redirected to a specific route
 */
export async function expectRedirect(
  page: Page,
  fromRoute: string,
  toRoute: string
): Promise<void> {
  await navigateToRoute(page, fromRoute);
  await expectCurrentRoute(page, toRoute);
}

/**
 * Assert that a route is accessible (no redirect)
 */
export async function expectRouteAccessible(
  page: Page,
  route: string
): Promise<void> {
  await navigateToRoute(page, route);
  await expectCurrentRoute(page, route);
}

/**
 * Assert that a route is blocked (redirects)
 */
export async function expectRouteBlocked(
  page: Page,
  route: string,
  expectedRedirect: string
): Promise<void> {
  await navigateToRoute(page, route);
  await expectCurrentRoute(page, expectedRedirect);
}

/**
 * Route constants for tests
 */
export const TEST_ROUTES = {
  HOME: ROUTES.HOME,
  LOGIN: ROUTES.AUTH.LOGIN,
  REGISTER: ROUTES.AUTH.REGISTER,
  ACTIVATION_REQUIRED: ROUTES.ONBOARDING.ACTIVATION_REQUIRED,
  ONBOARDING_PROFILE: ROUTES.ONBOARDING.PROFILE,
  ONBOARDING_INTERESTS: ROUTES.ONBOARDING.INTERESTS,
  ONBOARDING_DONE: ROUTES.ONBOARDING.DONE,
  DASHBOARD: ROUTES.APP.DASHBOARD,
} as const;
