/**
 * Account Activation Page
 * Auth route - handles email activation links
 */

export default function ActivatePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Activate Account</h1>
        <p className="text-muted-foreground mt-2">
          Activating your account...
        </p>
      </div>
      {/* TODO: Add activation logic component in Phase 2 */}
      <div className="border border-input rounded-md p-8 text-center text-muted-foreground">
        Activation handler placeholder
      </div>
    </div>
  );
}
