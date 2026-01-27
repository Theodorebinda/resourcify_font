/**
 * Onboarding Flow Router
 * Renders the correct screen based on server-driven onboarding_step.
 */

"use client";

import { OnboardingProfileForm } from "./profile-form";
import { OnboardingInterestsForm } from "./interests-form";
import { useOnboardingStep } from "../../../services/api/queries/onboarding-queries";
import { ROUTES } from "../../../constants/routes";

export function OnboardingFlow() {
  const { data: onboardingStep, isLoading, error } = useOnboardingStep();

  if (isLoading) {
    return (
      <div className="rounded-md border border-input bg-muted/30 p-6 text-sm text-muted-foreground">
        Chargement de l&apos;onboarding...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Impossible de charger l&apos;onboarding. Réessaie dans un instant.
      </div>
    );
  }

  // Onboarding start is handled by dedicated page /onboarding/start/
  // This component only handles profile, interests, and completed states
  if (!onboardingStep || onboardingStep === "not_started") {
    return null; // Should not happen - user should be on /onboarding/start/
  }

  if (onboardingStep === "profile") {
    return <OnboardingProfileForm />;
  }

  if (onboardingStep === "interests") {
    return <OnboardingInterestsForm />;
  }

  if (onboardingStep === "completed") {
    return (
      <div className="rounded-md border border-input bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        Onboarding terminé. Redirection vers votre espace utilisateur...
        <div className="mt-4">
          <a className="text-primary underline" href={ROUTES.APP.USER}>
            Accéder à l&apos;espace utilisateur
          </a>
        </div>
      </div>
    );
  }

  return null;
}
