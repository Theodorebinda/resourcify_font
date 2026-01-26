import { OnboardingFlow } from "../../../components/features/onboarding/onboarding-flow";

/**
 * Onboarding Root Page
 * Renders the correct onboarding screen based on backend state.
 */
export default function OnboardingRootPage() {
  return (
    <div className="space-y-6">
      <OnboardingFlow />
    </div>
  );
}
