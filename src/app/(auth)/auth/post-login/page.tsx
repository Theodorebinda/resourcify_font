/**
 * Post-Login Page
 * 
 * Canonical entry point after successful login.
 * Conforme à ONBOARDING_REFONTE.md
 * 
 * Fetches user state via API and redirects to the correct page using getRouteForStep().
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../../../services/api/queries/auth-queries";
import { getRouteForStep } from "../../../../utils/onboarding-routes";
import { ROUTES } from "../../../../constants/routes";

export default function PostLoginPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();

  useEffect(() => {
    // Wait for query to complete
    if (isLoading) {
      return;
    }

    // If user is not activated, redirect to activation required
    if (user && !user.activated) {
      router.replace(ROUTES.ONBOARDING.ACTIVATION_REQUIRED);
      return;
    }

    // If user is activated, check onboarding step from user data
    // Utilise getRouteForStep() comme source unique de vérité
    if (user && user.activated && user.onboarding_step) {
      const targetRoute = getRouteForStep(user.onboarding_step);
      router.replace(targetRoute);
      return;
    }

    // Fallback: if no user data, redirect to login
    if (!user) {
      router.replace(ROUTES.AUTH.LOGIN);
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
        <p className="text-sm text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
