/**
 * App Dashboard Page
 * 
 * Protected route - only accessible to fully onboarded users.
 * Explicit state: fully_onboarded (enforced by middleware)
 * 
 * Rules:
 * - NO auth logic (middleware handles access)
 * - NO redirects
 * - NO conditional rendering based on guessed state
 * - Uses useUser() for server data (TanStack Query)
 * - Shows loading, error, and empty states
 * - NO business logic in JSX
 */

"use client";

import { useUser } from "../../../services/api/queries/auth-queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";
import { SomethingWentWrong } from "../../../components/error/something-went-wrong";
import { useServerError } from "../../../hooks/use-server-error";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";

export default function AppDashboardPage() {
  const { user, isLoading, error, isActivated, isOnboardingComplete } = useUser();
  const serverErrorResult = useServerError(error, () => {});
  const isServerError = serverErrorResult?.isServerError ?? false;

  // Infrastructure error (5xx, network)
  if (isServerError) {
    return (
      <SomethingWentWrong
        message="We encountered an error loading your dashboard. Please try again."
        onRetry={serverErrorResult?.retry}
      />
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state (business errors - 4xx)
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Dashboard</CardTitle>
          <CardDescription>{error.message || "An error occurred while loading your dashboard."}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Empty state (no user data)
  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No User Data</CardTitle>
          <CardDescription>Unable to load user information.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Success state - render dashboard content
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Welcome back{user.username ? `, ${user.username}` : ""}!
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your account.
        </p>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details and status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback>
                {user.username
                  ? user.username.slice(0, 2).toUpperCase()
                  : user.email.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              {user.username && (
                <p className="font-medium">{user.username}</p>
              )}
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant={isActivated ? "default" : "secondary"}>
              {isActivated ? "Activated" : "Not Activated"}
            </Badge>
            <Badge variant={isOnboardingComplete ? "default" : "secondary"}>
              {isOnboardingComplete ? "Onboarding Complete" : "Onboarding In Progress"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Stats Placeholder */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Resources</CardTitle>
            <CardDescription>Your resources</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
            <CardDescription>Recent activity</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Account settings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">—</p>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
