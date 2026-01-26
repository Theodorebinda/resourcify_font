/**
 * Onboarding Profile Form
 * 
 * Étape 2: Formulaire Profil
 * Conforme à ONBOARDING_REFONTE.md - Section 3.2
 * 
 * - Utilise useUser() comme source unique de vérité
 * - Pré-remplissage avec données backend
 * - Auto-réparation silencieuse en cas d'incohérence
 * - Pas de window.location.reload()
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { useUser } from "../../../services/api/queries/auth-queries";
import {
  useSubmitOnboardingProfile,
  type OnboardingProfilePayload,
} from "../../../services/api/queries/onboarding-queries";
import { useOnboardingGuard } from "../../../hooks/use-onboarding-guard";
import { getRouteForStep } from "../../../utils/onboarding-routes";
import { authKeys } from "../../../services/api/queries/auth-queries";
import type { User } from "../../../types";

const DEFAULT_FORM: OnboardingProfilePayload = {
  username: "",
  bio: "",
  avatar_url: "",
};

export function OnboardingProfileForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: isLoadingUser } = useUser();
  const { isValid, isLoading: isLoadingGuard } = useOnboardingGuard("profile");
  const submitProfile = useSubmitOnboardingProfile();
  const [formState, setFormState] = useState<OnboardingProfilePayload>(DEFAULT_FORM);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSubmitting = submitProfile.isPending;
  const isLoading = isLoadingUser || isLoadingGuard;

  // Pré-remplir le formulaire avec les données utilisateur
  useEffect(() => {
    if (!user) {
      return;
    }
    setFormState({
      username: user.username ?? "",
      bio: user.bio ?? "",
      avatar_url: user.avatar_url ?? "",
    });
  }, [user]);

  const canSubmit = useMemo(() => {
    return Boolean(formState.username.trim());
  }, [formState.username]);

  const handleChange = (field: keyof OnboardingProfilePayload) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormState((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!canSubmit || isSubmitting) {
      return;
    }

    // Vérification pré-submit (optimiste)
    if (user?.onboarding_step && user.onboarding_step !== "profile") {
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
      await submitProfile.mutateAsync({
        username: formState.username.trim(),
        bio: formState.bio?.trim() || "",
        avatar_url: formState.avatar_url?.trim() || "",
      });

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
        setErrorMessage("Impossible d'enregistrer. Réessaie dans un instant.");
      }
    }
  };

  // Affichage: spinner si loading, redirection silencieuse si étape incohérente
  if (isLoading) {
    return (
      <div className="rounded-md border border-input bg-muted/30 p-6 text-sm text-muted-foreground">
        Chargement du profil...
      </div>
    );
  }

  if (!isValid) {
    return null; // Redirection en cours (silencieuse)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="username">Nom d&apos;utilisateur</Label>
        <Input
          id="username"
          value={formState.username}
          onChange={handleChange("username")}
          placeholder="ex: theoBinda"
          autoComplete="username"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <textarea
          id="bio"
          className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={formState.bio}
          onChange={handleChange("bio")}
          placeholder="Parle-nous de toi..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="avatarUrl">Avatar (URL)</Label>
        <Input
          id="avatarUrl"
          value={formState.avatar_url}
          onChange={handleChange("avatar_url")}
          placeholder="https://"
          type="url"
        />
      </div>

      {errorMessage && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      <Button type="submit" disabled={!canSubmit || isSubmitting} className="w-full">
        {isSubmitting ? "Enregistrement..." : "Continuer"}
      </Button>
    </form>
  );
}
