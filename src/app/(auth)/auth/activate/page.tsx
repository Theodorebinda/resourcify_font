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

"use client";

import { ActivationHandler } from "../../../../components/features/auth/activation-handler";

export default function ActivatePage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <ActivationHandler />
    </div>
  );
}
