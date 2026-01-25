/**
 * Landing Page
 * Public route - no authentication required
 */

export default function LandingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-4">Welcome to Ressourcefy</h1>
      <p className="text-muted-foreground">
        Your platform for sharing and discovering resources.
      </p>
      {/* TODO: Add hero section, features, CTA in Phase 2 */}
    </div>
  );
}
