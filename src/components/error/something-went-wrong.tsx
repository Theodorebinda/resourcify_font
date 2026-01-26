/**
 * Global Server Error Component
 * 
 * Handles infrastructure-level failures:
 * - Backend unavailable
 * - Network errors
 * - Timeouts
 * - HTTP 5xx errors
 * - Unexpected server failures
 * 
 * This is NOT for business errors (auth, permissions, validation).
 * 
 * Usable by:
 * - React error boundaries
 * - TanStack Query error handling
 * - Middleware hard redirects
 * 
 * IMPORTANT:
 * - Never exposes technical details or stack traces
 * - Shows human-friendly messages
 * - Works even when user is unauthenticated
 */

"use client";

import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

interface SomethingWentWrongProps {
  /**
   * Optional retry function
   * If provided, shows a retry button
   */
  onRetry?: () => void;
  
  /**
   * Optional custom message
   * Defaults to a generic friendly message
   */
  message?: string;
  
  /**
   * Optional back action
   * If provided, shows a "Go back" button
   */
  onGoBack?: () => void;
}

export function SomethingWentWrong({
  onRetry,
  message = "Something went wrong on our end. Please try again in a moment.",
  onGoBack,
}: SomethingWentWrongProps) {
  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Something Went Wrong</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {onRetry && (
            <Button onClick={onRetry} className="w-full">
              Try Again
            </Button>
          )}
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="w-full"
          >
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
