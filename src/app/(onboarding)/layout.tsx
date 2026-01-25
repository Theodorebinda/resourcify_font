/**
 * Onboarding Layout
 * For users completing onboarding flow
 * Phase 1: Minimal structural layout
 */

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* TODO: Add onboarding progress indicator in Phase 2 */}
        <main className="max-w-2xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
