/**
 * Onboarding Interests Form
 * 
 * Étape 3: Sélection Intérêts
 * Conforme à ONBOARDING_REFONTE.md - Section 3.3
 * 
 * - Utilise useUser() comme source unique de vérité
 * - Auto-réparation silencieuse en cas d'incohérence
 * - Pas de window.location.reload()
 */

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import { Label } from "../../ui/label";
import { useUser } from "../../../services/api/queries/auth-queries";
import { useSubmitOnboardingInterests } from "../../../services/api/queries/onboarding-queries";
import { useOnboardingGuard } from "../../../hooks/use-onboarding-guard";
import { getRouteForStep } from "../../../utils/onboarding-routes";
import { authKeys } from "../../../services/api/queries/auth-queries";
import type { User } from "../../../types";

const TAGS = [
  { id: "frontend", label: "Frontend" },
  { id: "backend", label: "Backend" },
  { id: "design", label: "Design" },
  { id: "devops", label: "DevOps" },
  { id: "data", label: "Data" },
  { id: "product", label: "Product" },
];

export function OnboardingInterestsForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: isLoadingUser } = useUser();
  const { isValid, isLoading: isLoadingGuard } = useOnboardingGuard("interests");
  const submitInterests = useSubmitOnboardingInterests();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSubmitting = submitInterests.isPending;
  const isLoading = isLoadingUser || isLoadingGuard;

  const canSubmit = useMemo(() => selectedTags.length > 0, [selectedTags]);

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!canSubmit || isSubmitting) {
      return;
    }

    // Vérification pré-submit (optimiste)
    if (user?.onboarding_step && user.onboarding_step !== "interests") {
      // État a changé entre le montage et la soumission
      await queryClient.invalidateQueries({ queryKey: authKeys.user() });
      await queryClient.refetchQueries({ queryKey: authKeys.user() });
      const updatedUser = queryClient.getQueryData<typeof user>(authKeys.user());
      if (updatedUser?.onboarding_step) {
        router.replace(getRouteForStep(updatedUser.onboarding_step));
      }
      return;
    }

    try {
      await submitInterests.mutateAsync({ tag_ids: selectedTags });

      // Mutation invalide authKeys.user()
      // Refetch et redirection
      await queryClient.refetchQueries({ queryKey: authKeys.user() });
      const updatedUser = queryClient.getQueryData<typeof user>(authKeys.user());
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
        // Erreur réseau ou validation
        setErrorMessage("Impossible d'enregistrer les intérêts. Réessaie dans un instant.");
      }
    }
  };

  // Affichage: spinner si loading, redirection silencieuse si étape incohérente
  if (isLoading) {
    return (
      <div className="rounded-md border border-input bg-muted/30 p-6 text-sm text-muted-foreground">
        Chargement des intérêts...
      </div>
    );
  }

  if (!isValid) {
    return null; // Redirection en cours (silencieuse)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        {TAGS.map((tag) => {
          const checked = selectedTags.includes(tag.id);
          return (
            <div key={tag.id} className="flex items-center gap-3 rounded-md border border-input px-4 py-3">
              <Checkbox
                id={`tag-${tag.id}`}
                checked={checked}
                onCheckedChange={() => toggleTag(tag.id)}
              />
              <Label htmlFor={`tag-${tag.id}`} className="text-sm font-medium">
                {tag.label}
              </Label>
            </div>
          );
        })}
      </div>

      {!canSubmit && (
        <div className="text-sm text-muted-foreground">
          Sélectionne au moins un centre d&apos;intérêt pour continuer.
        </div>
      )}

      {errorMessage && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      <Button type="submit" disabled={!canSubmit || isSubmitting} className="w-full">
        {isSubmitting ? "Enregistrement..." : "Terminer l'onboarding"}
      </Button>
    </form>
  );
}
