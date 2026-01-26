/**
 * Post-Login Page
 * 
 * Canonical entry point after successful login.
 * 
 * Fetches user state via API and redirects to the correct page.
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../../../services/api/queries/auth-queries";
import { useOnboardingStep } from "../../../../services/api/queries/onboarding-queries";
import { ROUTES } from "../../../../constants/routes";

export default function PostLoginPage() {
  const router = useRouter();
  const { user, isLoading: isLoadingUser } = useUser();
  const { data: onboardingStep, isLoading: isLoadingOnboarding } = useOnboardingStep();

  useEffect(() => {
    // Wait for both queries to complete
    if (isLoadingUser || isLoadingOnboarding) {
      return;
    }

    // If user is not activated, redirect to activation required
    if (user && !user.activated) {
      router.replace(ROUTES.ONBOARDING.ACTIVATION_REQUIRED);
      return;
    }

    // If user is activated, check onboarding step
    if (user && user.activated && onboardingStep) {
      if (onboardingStep === "not_started") {
        router.replace(ROUTES.ONBOARDING.START);
      } else if (onboardingStep === "profile") {
        router.replace(ROUTES.ONBOARDING.PROFILE);
      } else if (onboardingStep === "interests") {
        router.replace(ROUTES.ONBOARDING.INTERESTS);
      } else if (onboardingStep === "completed") {
        router.replace(ROUTES.APP.USER);
      }
      return;
    }

    // Fallback: if no user data, redirect to login
    if (!user) {
      router.replace(ROUTES.AUTH.LOGIN);
    }
  }, [user, onboardingStep, isLoadingUser, isLoadingOnboarding, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
        <p className="text-sm text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
