/**
 * Activation Required Page
 * Shown to authenticated users who haven't activated their account
 * Explicit state: authenticated_not_activated
 */

export default function ActivationRequiredPage() {
  return (
    <div className="space-y-6 text-center">
      <div>
        <h1 className="text-3xl font-bold mb-4">Activation Required</h1>
        <p className="text-muted-foreground">
          Please check your email and click the activation link to continue.
        </p>
      </div>
      {/* TODO: Add resend activation email button in Phase 2 */}
      <div className="border border-input rounded-md p-8 text-center text-muted-foreground">
        Resend activation email placeholder
      </div>
    </div>
  );
}
