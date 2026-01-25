/**
 * Activation Required Page
 * 
 * Shown to authenticated users who haven't activated their account.
 * Explicit state: AUTHENTICATED_NOT_ACTIVATED
 * 
 * UX Requirements:
 * - Clear explanation
 * - Resend activation email functionality
 * - No access to app or onboarding (enforced by middleware)
 */

"use client";

import { useUser } from "../../../../services/api/queries/auth-queries";
import { ResendActivation } from "../../../../components/features/auth/resend-activation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { SomethingWentWrong } from "../../../../components/error/something-went-wrong";
import { useServerError } from "../../../../hooks/use-server-error";

export default function ActivationRequiredPage() {
  const { user, isLoading, error, isActivated } = useUser();
  const serverError = useServerError(error, () => {});

  // Infrastructure error
  if (serverError) {
    return <SomethingWentWrong message="We encountered an error. Please try again." />;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // If somehow activated, this shouldn't happen (middleware should redirect)
  // But handle gracefully
  if (isActivated) {
    return null; // Will redirect via middleware
  }

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl mb-2">Activation Required</CardTitle>
          <CardDescription className="text-base">
            Please check your email and click the activation link to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user?.email && (
            <div className="text-sm text-muted-foreground text-center">
              We sent an activation link to <span className="font-medium text-foreground">{user.email}</span>
            </div>
          )}
          
          <div className="pt-4">
            <ResendActivation email={user?.email} />
          </div>

          <div className="text-xs text-muted-foreground text-center pt-4 border-t">
            <p>Didn&apos;t receive the email? Check your spam folder or request a new activation email.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
