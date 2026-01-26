/**
 * Onboarding Done Page
 * Final step of onboarding flow
 * Redirects to /app after completion
 * Explicit state: fully_onboarded
 */

export default function OnboardingDonePage() {
  return (
    <div className="space-y-6 text-center">
      <div>
        <h1 className="text-3xl font-bold mb-4">Welcome to Ressourcefy!</h1>
        <p className="text-muted-foreground">
          Your account is set up and ready to go.
        </p>
      </div>
      {/* TODO: Add redirect to /app logic in Phase 2 */}
      <div className="border border-input rounded-md p-8 text-center text-muted-foreground">
        Redirecting to dashboard...
      </div>
    </div>
  );
}
