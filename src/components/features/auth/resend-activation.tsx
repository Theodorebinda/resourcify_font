/**
 * Resend Activation Email Component
 * 
 * Allows users to request a new activation email.
 * Shows loading, success, and error states.
 */

"use client";

import { useState } from "react";
import { useResendActivation } from "../../../services/api/queries/auth-queries";
import { Button } from "../../ui/button";
import { useToast } from "../../../hooks/use-toast";
import { useServerError } from "../../../hooks/use-server-error";
import { SomethingWentWrong } from "../../error/something-went-wrong";

interface ResendActivationProps {
  email?: string;
}

export function ResendActivation({ email }: ResendActivationProps) {
  const { toast: showToast } = useToast();
  const resendMutation = useResendActivation();
  const serverError = useServerError(resendMutation.error, () => resendMutation.reset());
  const [hasResent, setHasResent] = useState(false);

  const handleResend = async () => {
    try {
      await resendMutation.mutateAsync();
      setHasResent(true);
      showToast({
        title: "Activation Email Sent",
        description: "Please check your email for the activation link.",
      });
    } catch (error) {
      // Error is handled by mutation error state
    }
  };

  // Infrastructure error
  if (serverError) {
    return (
      <SomethingWentWrong
        onRetry={handleResend}
        message="We encountered an error while sending the activation email. Please try again."
      />
    );
  }

  return (
    <div className="space-y-4">
      {hasResent ? (
        <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Activation email sent!</p>
          <p className="mt-1">
            Please check your {email && <span className="font-medium">{email}</span>} inbox
            and click the activation link.
          </p>
        </div>
      ) : (
        <Button
          onClick={handleResend}
          disabled={resendMutation.isPending}
          variant="outline"
          className="w-full"
        >
          {resendMutation.isPending ? "Sending..." : "Resend Activation Email"}
        </Button>
      )}
    </div>
  );
}
