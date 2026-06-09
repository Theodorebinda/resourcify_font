/**
 * User Profile Page
 * 
 * Displays user information and profile details
 */

"use client";

import { useUser } from "../../../../services/api/queries/auth-queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Skeleton } from "../../../../components/ui/skeleton";
import { SomethingWentWrong } from "../../../../components/error/something-went-wrong";
import { useServerError } from "../../../../hooks/use-server-error";
import { Avatar, AvatarFallback } from "../../../../components/ui/avatar";
import { Badge } from "../../../../components/ui/badge";
import { Mail, Calendar, User as UserIcon, Shield } from "lucide-react";

export default function ProfilePage() {
  const { user, isLoading, error } = useUser();
  const serverErrorResult = useServerError(error, () => {});
  const isServerError = serverErrorResult?.isServerError ?? false;

  // Infrastructure error (5xx, network)
  if (isServerError) {
    return (
      <SomethingWentWrong
        message="We encountered an error loading your profile. Please try again."
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
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state (business errors - 4xx)
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Profile</CardTitle>
          <CardDescription>
            {error.message || "An error occurred while loading your profile."}
          </CardDescription>
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

  // Success state - render profile content
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Mon profil</h1>
        <p className="text-muted-foreground">
          Consultez et gérez vos informations personnelles
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>Vos informations de compte</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar and Basic Info */}
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-2xl">
                {user.username
                  ? user.username.slice(0, 2).toUpperCase()
                  : user.email.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">
                  {user.username || "Utilisateur"}
                </h2>
                {user.bio && (
                  <p className="text-muted-foreground mt-1">{user.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/30">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            {user.username && (
              <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/30">
                <UserIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Nom d&apos;utilisateur</p>
                  <p className="text-sm text-muted-foreground">{user.username}</p>
                </div>
              </div>
            )}

            {user.createdAt && (
              <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/30">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Membre depuis</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}

            {user.role && (
              <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/30">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Rôle</p>
                  <div className="mt-1">
                    <Badge variant="outline">{user.role}</Badge>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
            <Badge variant={user.activated ? "default" : "secondary"}>
              {user.activated ? "Compte activé" : "Compte non activé"}
            </Badge>
            <Badge
              variant={
                user.onboarding_step === "completed" ? "default" : "secondary"
              }
            >
              {user.onboarding_step === "completed"
                ? "Onboarding terminé"
                : "Onboarding en cours"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
