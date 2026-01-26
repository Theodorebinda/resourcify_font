/**
 * Reset Password Page
 * Auth route - requires token from email
 */

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Set New Password</h1>
        <p className="text-muted-foreground mt-2">
          Enter your new password below
        </p>
      </div>
      {/* TODO: Add reset password form component in Phase 2 */}
      <div className="border border-input rounded-md p-8 text-center text-muted-foreground">
        Reset password form placeholder
      </div>
    </div>
  );
}
