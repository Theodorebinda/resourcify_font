/**
 * Resend Activation Email Component
 * 
 * Allows users to request a new activation email.
 * Shows loading, success, and error states.
 */

"use client";

import { useState, useMemo } from "react";
import { useResendActivation, useUser } from "../../../services/api/queries/auth-queries";
import { Button } from "../../ui/button";
import { useToast } from "../../../hooks/use-toast";
import { useServerError } from "../../../hooks/use-server-error";
import { SomethingWentWrong } from "../../error/something-went-wrong";

interface ResendActivationProps {
  email?: string;
}

export function ResendActivation({ email: propEmail }: ResendActivationProps) {
  const { toast: showToast } = useToast();
  const { user } = useUser();
  const resendMutation = useResendActivation();
  const serverError = useServerError(resendMutation.error, () => resendMutation.reset());
  const [hasResent, setHasResent] = useState(false);

  // Get email from prop, user data, or last login email from localStorage
  const email = useMemo(() => {
    // Priority: prop > user email > last login email
    if (propEmail) return propEmail;
    if (user?.email) return user.email;
    
    // Fallback: get last login email from localStorage
    if (typeof window !== "undefined") {
      return localStorage.getItem("last_login_email") || "";
    }
    return "";
  }, [propEmail, user?.email]);

  const handleResend = async () => {
    if (!email) {
      showToast({
        title: "Email Required",
        description: "Please provide an email address to resend the activation link.",
        variant: "destructive",
      });
      return;
    }

    try {
      await resendMutation.mutateAsync({ email });
      setHasResent(true);
      showToast({
        title: "Activation Email Sent",
        description: "Please check your email for the activation link.",
      });
    } catch {
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
