/**
 * Onboarding Start Card
 * 
 * Étape 1: Démarrage Onboarding
 * Conforme à ONBOARDING_REFONTE.md - Section 3.1
 * 
 * - Utilise useUser() comme source unique de vérité
 * - Auto-réparation silencieuse en cas d'incohérence
 * - Pas de window.location.reload()
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../../ui/button";
import { useStartOnboarding } from "../../../services/api/queries/onboarding-queries";
import { useUser } from "../../../services/api/queries/auth-queries";
import { useOnboardingGuard } from "../../../hooks/use-onboarding-guard";
import { getRouteForStep } from "../../../utils/onboarding-routes";
import { authKeys } from "../../../services/api/queries/auth-queries";
import type { User } from "../../../types";

export function OnboardingStartCard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: isLoadingUser } = useUser();
  const { isValid, isLoading: isLoadingGuard } = useOnboardingGuard("not_started");
  const startOnboarding = useStartOnboarding();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isLoading = isLoadingUser || isLoadingGuard;

  const handleStart = async () => {
    setErrorMessage(null);

      // Vérification pré-submit (optimiste)
      if (user?.onboarding_step && user.onboarding_step !== "not_started") {
        // État a changé, auto-réparation
        await queryClient.invalidateQueries({ queryKey: authKeys.user() });
        await queryClient.refetchQueries({ queryKey: authKeys.user() });
        const updatedUser = queryClient.getQueryData<User>(authKeys.user());
        if (updatedUser?.onboarding_step) {
          router.replace(getRouteForStep(updatedUser.onboarding_step));
        }
        return;
      }

      try {
        await startOnboarding.mutateAsync();
        
        // Mutation invalide authKeys.user()
        // Refetch et redirection
        await queryClient.refetchQueries({ queryKey: authKeys.user() });
        const updatedUser = queryClient.getQueryData<User>(authKeys.user());
        if (updatedUser?.onboarding_step) {
          router.replace(getRouteForStep(updatedUser.onboarding_step));
        }
      } catch (error) {
        const apiError = error as { code?: string };
        if (apiError.code === "invalid_onboarding_step") {
          // Auto-réparation silencieuse (RÈGLE #9)
          await queryClient.invalidateQueries({ queryKey: authKeys.user() });
          await queryClient.refetchQueries({ queryKey: authKeys.user() });
          const updatedUser = queryClient.getQueryData<User>(authKeys.user());
          if (updatedUser?.onboarding_step) {
            router.replace(getRouteForStep(updatedUser.onboarding_step));
          }
        } else {
          // Erreur réseau: afficher message générique
          setErrorMessage("Impossible de démarrer. Réessaie dans un instant.");
        }
      }
  };

  // Affichage: spinner si loading, redirection silencieuse si étape incohérente
  if (isLoading) {
    return (
      <div className="rounded-md border border-input bg-muted/30 p-6 text-sm text-muted-foreground">
        Chargement...
      </div>
    );
  }

  if (!isValid) {
    return null; // Redirection en cours (silencieuse)
  }

  return (
    <div className="rounded-md border border-input bg-background p-6 text-center space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2">Bienvenue sur Ressourcefy</h1>
        <p className="text-muted-foreground">
          Démarre l&apos;onboarding pour compléter ton profil.
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      <Button onClick={handleStart} disabled={startOnboarding.isPending}>
        {startOnboarding.isPending ? "Chargement..." : "Commencer"}
      </Button>
    </div>
  );
}
