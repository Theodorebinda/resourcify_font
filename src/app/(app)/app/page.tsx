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
import { CreateResourceForm } from "../../../components/features/resources/create-resource-form";
import { ResourceList } from "../../../components/features/resources/resource-list";
import { ThemeSelector } from "@/src/components/shared/theme-selector";

export default function AppDashboardPage() {
  const { user, isLoading, error } = useUser();
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

 
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <div className="flex justify-between items-center w-full gap-2">
        <h1 className="text-xl font-bold mb-2">
          Welcome back{user.username ? `, ${user.username}` : ""}!
          </h1>
          <ThemeSelector/>
        </div>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your account.
        </p>
      </div>

      {/* Create Resource Form */}
      <CreateResourceForm />

      {/* Resources List */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Ressources</h2>
        <ResourceList />
      </div>
    </div>
  );
}
