/**
 * Onboarding route utilities
 * Maps onboarding steps to routes
 */

import type { OnboardingStep } from "../types";
import { ROUTES } from "../constants/routes";

/**
 * Maps onboarding step to the corresponding route
 */
export const ONBOARDING_STEP_TO_ROUTE: Record<OnboardingStep, string> = {
  not_started: ROUTES.ONBOARDING.ROOT,
  profile: ROUTES.ONBOARDING.PROFILE,
  interests: ROUTES.ONBOARDING.INTERESTS,
  completed: ROUTES.APP.USER,
};

/**
 * Maps route to onboarding step
 */
export const ROUTE_TO_ONBOARDING_STEP: Record<string, OnboardingStep> = {
  [ROUTES.ONBOARDING.PROFILE]: "profile",
  [ROUTES.ONBOARDING.INTERESTS]: "interests",
  [ROUTES.ONBOARDING.DONE]: "completed",
};

/**
 * Get the correct route for a given onboarding step
 */
export function getRouteForStep(step: OnboardingStep): string {
  return ONBOARDING_STEP_TO_ROUTE[step];
}

/**
 * Check if a step can access a route
 * Returns true if the step is allowed to access the route
 */
export function canAccessRoute(
  currentStep: OnboardingStep,
  targetRoute: string
): boolean {
  // If completed, can access app routes
  if (currentStep === "completed") {
    return targetRoute.startsWith("/app") || targetRoute.startsWith("/user");
  }

  // If not_started, can only access profile
  if (currentStep === "not_started") {
    return targetRoute === ROUTES.ONBOARDING.PROFILE;
  }

  // If profile, can access profile and interests
  if (currentStep === "profile") {
    return (
      targetRoute === ROUTES.ONBOARDING.PROFILE ||
      targetRoute === ROUTES.ONBOARDING.INTERESTS
    );
  }

  // If interests, can access interests and done
  if (currentStep === "interests") {
    return (
      targetRoute === ROUTES.ONBOARDING.INTERESTS ||
      targetRoute === ROUTES.ONBOARDING.DONE
    );
  }

  return false;
}

/**
 * Get the next step in the onboarding flow
 */
export function getNextStep(currentStep: OnboardingStep): OnboardingStep | null {
  const stepOrder: OnboardingStep[] = [
    "not_started",
    "profile",
    "interests",
    "completed",
  ];
  const currentIndex = stepOrder.indexOf(currentStep);
  if (currentIndex === -1 || currentIndex === stepOrder.length - 1) {
    return null;
  }
  return stepOrder[currentIndex + 1];
}
