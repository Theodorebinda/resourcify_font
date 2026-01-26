/**
 * Onboarding Layout
 * For users completing onboarding flow
 * Displays server-driven onboarding progress
 */

import { OnboardingProgress } from "../../components/onboarding/onboarding-progress";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <OnboardingProgress />
        <main className="max-w-2xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
