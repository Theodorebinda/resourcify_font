/**
 * Onboarding Profile Page
 * Step 1 of onboarding flow
 * Explicit state: onboarding_in_progress
 */

import { OnboardingProfileForm } from "../../../../components/features/onboarding/profile-form";

export default function OnboardingProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-4">Complète ton profil</h1>
        <p className="text-muted-foreground">
          Partage quelques informations pour commencer.
        </p>
      </div>
      <OnboardingProfileForm />
    </div>
  );
}
