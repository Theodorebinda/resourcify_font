/**
 * Post-Login Page
 * 
 * Canonical entry point after successful login.
 * 
 * Rules:
 * - NO business logic
 * - NO redirect logic in component
 * - NO user state checks
 * - Middleware decides the next step based on user state
 * 
 * Purpose:
 * - Single entry point for all post-login flows
 * - Lets middleware redirect to:
 *   - /onboarding/activation-required (if not activated)
 *   - /onboarding/profile (if activated but not onboarded)
 *   - /app (if fully onboarded)
 */

export default function PostLoginPage() {
  // Minimal UI - middleware will redirect immediately
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
        <p className="text-sm text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
