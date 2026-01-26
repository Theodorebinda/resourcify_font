/**
 * Onboarding Interests Page
 * Step 2 of onboarding flow
 * Explicit state: onboarding_in_progress
 */

export default function OnboardingInterestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-4">Select Your Interests</h1>
        <p className="text-muted-foreground">
          Choose topics you&apos;re interested in to personalize your experience.
        </p>
      </div>
      {/* TODO: Add interests selection component in Phase 2 */}
      <div className="border border-input rounded-md p-8 text-center text-muted-foreground">
        Interests selection placeholder
      </div>
    </div>
  );
}
