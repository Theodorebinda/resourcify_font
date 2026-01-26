/**
 * Onboarding Interests Page
 * Step 2 of onboarding flow
 * Explicit state: onboarding_in_progress
 */

import { OnboardingInterestsForm } from "../../../../components/features/onboarding/interests-form";

export default function OnboardingInterestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-4">Sélectionne tes intérêts</h1>
        <p className="text-muted-foreground">
          Choisis les sujets qui t&apos;intéressent pour personnaliser ton expérience.
        </p>
      </div>
      <OnboardingInterestsForm />
    </div>
  );
}
