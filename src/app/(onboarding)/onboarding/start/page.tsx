/**
 * Onboarding Start Page
 * Dedicated page to start the onboarding process.
 * Separate from activation (which is account activation).
 */

import { OnboardingStartCard } from "../../../../components/features/onboarding/onboarding-start-card";

export default function OnboardingStartPage() {
  return (
    <div className="space-y-6">
      <OnboardingStartCard />
    </div>
  );
}
