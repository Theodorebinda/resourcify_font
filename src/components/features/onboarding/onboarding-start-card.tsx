/**
 * Onboarding Start Card
 * Triggers onboarding start based on backend state.
 */

"use client";

import { useState } from "react";
import { Button } from "../../ui/button";
import { useStartOnboarding } from "../../../services/api/queries/onboarding-queries";
import { useOnboardingStep } from "../../../services/api/queries/onboarding-queries";

export function OnboardingStartCard() {
  const { data: onboardingStep, refetch } = useOnboardingStep();
  const startOnboarding = useStartOnboarding();
  const [message, setMessage] = useState<string | null>(null);

  const handleStart = async () => {
    setMessage(null);

    if (onboardingStep && onboardingStep !== "not_started") {
      setMessage("Étape expirée, redirection...");
      await refetch();
      return;
    }

    try {
      await startOnboarding.mutateAsync();
      await refetch();
    } catch (error) {
      const apiError = error as { code?: string };
      if (apiError.code === "invalid_onboarding_step") {
        setMessage("Étape expirée, redirection...");
        await refetch();
        return;
      }
      setMessage("Impossible de démarrer l'onboarding. Réessaie dans un instant.");
    }
  };

  return (
    <div className="rounded-md border border-input bg-background p-6 text-center space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2">Bienvenue sur Ressourcefy</h1>
        <p className="text-muted-foreground">
          Démarre l&apos;onboarding pour compléter ton profil.
        </p>
      </div>

      {message && (
        <div className="rounded-md border border-muted bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          {message}
        </div>
      )}

      <Button onClick={handleStart} disabled={startOnboarding.isPending}>
        {startOnboarding.isPending ? "Chargement..." : "Commencer"}
      </Button>
    </div>
  );
}
