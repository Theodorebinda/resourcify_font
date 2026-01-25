/**
 * App Dashboard
 * Protected route - only accessible to fully onboarded users
 * Explicit state: fully_onboarded
 */

export default function AppDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your Ressourcefy dashboard.
        </p>
      </div>
      {/* TODO: Add dashboard content in Phase 2 */}
      <div className="border border-input rounded-md p-8 text-center text-muted-foreground">
        Dashboard content placeholder
      </div>
    </div>
  );
}
