/**
 * Onboarding Root Page
 * Middleware redirects to the correct onboarding step.
 */

export default function OnboardingRootPage() {
  return (
    <div className="space-y-6 text-center">
      <div>
        <h1 className="text-3xl font-bold mb-4">Mise en place en cours</h1>
        <p className="text-muted-foreground">
          Nous préparons votre parcours d&apos;onboarding.
        </p>
      </div>
      <div className="border border-input rounded-md p-8 text-center text-muted-foreground">
        Redirection en cours...
      </div>
    </div>
  );
}
