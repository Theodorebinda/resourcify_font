/**
 * Account Activation Page
 * 
 * Handles email activation links with token parameter.
 * 
 * States:
 * - Loading: Processing activation
 * - Success: Redirects to onboarding
 * - Error: Shows specific error (invalid, expired, already activated)
 */

import { Suspense } from "react";
import { ActivationHandler } from "../../../../components/features/auth/activation-handler";

function ActivationContent() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <ActivationHandler />
    </div>
  );
}

export default function ActivatePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <ActivationContent />
    </Suspense>
  );
}
