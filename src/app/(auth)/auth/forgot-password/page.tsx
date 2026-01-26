/**
 * Forgot Password Page
 * Auth route
 */

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reset Password</h1>
        <p className="text-muted-foreground mt-2">
          Enter your email to receive a password reset link
        </p>
      </div>
      {/* TODO: Add forgot password form component in Phase 2 */}
      <div className="border border-input rounded-md p-8 text-center text-muted-foreground">
        Forgot password form placeholder
      </div>
    </div>
  );
}
