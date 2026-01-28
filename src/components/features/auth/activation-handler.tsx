/**
 * Activation Handler Component
 * 
 * Handles account activation via token from email link.
 * 
 * States:
 * - Loading: Processing activation
 * - Success: Account activated, redirect to onboarding
 * - Error: Invalid/expired token, show error with options
 * 
 * Error Handling:
 * - invalid_token → Show error message
 * - expired_token → Show error + resend option
 * - already_activated → Show message + login link
 * - 5xx/network → Route to SomethingWentWrong
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useActivateAccount } from "../../../services/api/queries/auth-queries";
import { useServerError } from "../../../hooks/use-server-error";
import { SomethingWentWrong } from "../../error/something-went-wrong";
import { Button } from "../../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { useToast } from "../../../hooks/use-toast";
import { ROUTES } from "../../../constants/routes";
import Link from "next/link";
import type { ApiError } from "../../../types";

export function ActivationHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast: showToast } = useToast();
  const [activationToken, setActivationToken] = useState<string | null>(null);
  
  const activateMutation = useActivateAccount();
  const serverError = useServerError(activateMutation.error, () => activateMutation.reset());

  // Extract token from URL
  useEffect(() => {
    if (!searchParams) return;
    const token = searchParams.get("token");
    if (token) {
      setActivationToken(token);
      activateMutation.mutate({ token });
    }
  }, [activateMutation, searchParams]);

  // Handle success
  useEffect(() => {
    if (activateMutation.isSuccess) {
      showToast({
        title: "Account Activated",
        description: "Your account has been successfully activated.",
      });
      // Redirect to onboarding start
      router.push(ROUTES.ONBOARDING.PROFILE);
    }
  }, [activateMutation.isSuccess, router, showToast]);

  // Infrastructure error (5xx, network)
  if (serverError) {
    return (
      <SomethingWentWrong
        onRetry={() => activationToken && activateMutation.mutate({ token: activationToken })}
        message="We encountered an error while activating your account. Please try again."
      />
    );
  }

  // Loading state
  if (activateMutation.isPending || !activationToken) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Activating Account</CardTitle>
          <CardDescription>Please wait while we activate your account...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state - business errors (4xx)
  if (activateMutation.isError) {
    const error = activateMutation.error as ApiError;
    
    // Invalid token
    if (error.code === "invalid_token") {
      return (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Activation Link</CardTitle>
            <CardDescription>
              The activation link is invalid. Please request a new activation email.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => router.push(ROUTES.ONBOARDING.ACTIVATION_REQUIRED)}
              className="w-full"
            >
              Request New Activation Email
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              <Link href={ROUTES.AUTH.LOGIN} className="text-primary hover:underline">
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Expired token
    if (error.code === "expired_token") {
      return (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Activation Link Expired</CardTitle>
            <CardDescription>
              This activation link has expired. Please request a new one.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => router.push(ROUTES.ONBOARDING.ACTIVATION_REQUIRED)}
              className="w-full"
            >
              Request New Activation Email
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              <Link href={ROUTES.AUTH.LOGIN} className="text-primary hover:underline">
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Already activated
    if (error.code === "already_activated") {
      return (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Account Already Activated</CardTitle>
            <CardDescription>
              Your account is already activated. You can sign in now.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push(ROUTES.AUTH.LOGIN)}
              className="w-full"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      );
    }

    // Generic error
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Activation Failed</CardTitle>
          <CardDescription>{error.message || "An error occurred during activation."}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => router.push(ROUTES.ONBOARDING.ACTIVATION_REQUIRED)}
            variant="outline"
            className="w-full"
          >
            Request New Activation Email
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Success state (should redirect, but show confirmation if needed)
  return null;
}
