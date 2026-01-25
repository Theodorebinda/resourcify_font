/**
 * Login Page
 * Auth route - redirects to app if already authenticated
 */

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sign In</h1>
        <p className="text-muted-foreground mt-2">
          Enter your credentials to access your account
        </p>
      </div>
      {/* TODO: Add login form component in Phase 2 */}
      <div className="border border-input rounded-md p-8 text-center text-muted-foreground">
        Login form placeholder
      </div>
    </div>
  );
}
