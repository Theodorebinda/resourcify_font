/**
 * Onboarding Profile Page
 * Step 1 of onboarding flow
 * Explicit state: onboarding_in_progress
 */

export default function OnboardingProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-4">Complete Your Profile</h1>
        <p className="text-muted-foreground">
          Tell us a bit about yourself to get started.
        </p>
      </div>
      {/* TODO: Add profile form component in Phase 2 */}
      <div className="border border-input rounded-md p-8 text-center text-muted-foreground">
        Profile form placeholder
      </div>
    </div>
  );
}
