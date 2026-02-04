/**
 * User Settings Page
 * 
 * User account settings and preferences
 */

"use client";

import { useUser } from "../../../../services/api/queries/auth-queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Skeleton } from "../../../../components/ui/skeleton";
import { SomethingWentWrong } from "../../../../components/error/something-went-wrong";
import { useServerError } from "../../../../hooks/use-server-error";
import { ThemeSelector } from "../../../../components/shared/theme-selector";
import { Bell, Lock, Shield, Globe } from "lucide-react";

export default function SettingsPage() {
  const { user, isLoading, error } = useUser();
  const serverErrorResult = useServerError(error, () => {});
  const isServerError = serverErrorResult?.isServerError ?? false;

  // Infrastructure error (5xx, network)
  if (isServerError) {
    return (
      <SomethingWentWrong
        message="We encountered an error loading your settings. Please try again."
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
          <CardTitle>Error Loading Settings</CardTitle>
          <CardDescription>
            {error.message || "An error occurred while loading your settings."}
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

  // Success state - render settings content
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Paramètres</h1>
        <p className="text-muted-foreground">
          Gérez vos préférences et paramètres de compte
        </p>
      </div>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Apparence
          </CardTitle>
          <CardDescription>
            Personnalisez l&apos;apparence de l&apos;application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Thème</p>
              <p className="text-sm text-muted-foreground">
                Choisissez entre le thème clair et sombre
              </p>
            </div>
            <ThemeSelector />
          </div>
        </CardContent>
      </Card>

      {/* Notifications Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Gérez vos préférences de notification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
              <div>
                <p className="font-medium">Notifications par email</p>
                <p className="text-sm text-muted-foreground">
                  Recevez des notifications par email
                </p>
              </div>
              <p className="text-sm text-muted-foreground">Bientôt disponible</p>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
              <div>
                <p className="font-medium">Notifications push</p>
                <p className="text-sm text-muted-foreground">
                  Recevez des notifications push
                </p>
              </div>
              <p className="text-sm text-muted-foreground">Bientôt disponible</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Sécurité
          </CardTitle>
          <CardDescription>
            Gérez la sécurité de votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
              <div>
                <p className="font-medium">Changer le mot de passe</p>
                <p className="text-sm text-muted-foreground">
                  Mettez à jour votre mot de passe
                </p>
              </div>
              <p className="text-sm text-muted-foreground">Bientôt disponible</p>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
              <div>
                <p className="font-medium">Authentification à deux facteurs</p>
                <p className="text-sm text-muted-foreground">
                  Ajoutez une couche de sécurité supplémentaire
                </p>
              </div>
              <p className="text-sm text-muted-foreground">Bientôt disponible</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Compte
          </CardTitle>
          <CardDescription>
            Informations sur votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-border bg-muted/30">
              <p className="font-medium mb-1">Email</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            {user.role && (
              <div className="p-4 rounded-lg border border-border bg-muted/30">
                <p className="font-medium mb-1">Rôle</p>
                <p className="text-sm text-muted-foreground">{user.role}</p>
              </div>
            )}
            <div className="p-4 rounded-lg border border-border bg-muted/30">
              <p className="font-medium mb-1">Statut du compte</p>
              <p className="text-sm text-muted-foreground">
                {user.activated ? "Activé" : "Non activé"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
