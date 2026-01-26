/**
 * Onboarding Interests Form
 * Minimal UI that submits data to backend and relies on middleware for redirects.
 */

"use client";

import { useMemo, useState } from "react";
import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import { Label } from "../../ui/label";
import { useUser } from "../../../services/api/queries/auth-queries";
import {
  useSubmitOnboardingInterests,
} from "../../../services/api/queries/onboarding-queries";

const TAGS = [
  { id: "frontend", label: "Frontend" },
  { id: "backend", label: "Backend" },
  { id: "design", label: "Design" },
  { id: "devops", label: "DevOps" },
  { id: "data", label: "Data" },
  { id: "product", label: "Product" },
];

export function OnboardingInterestsForm() {
  const { refetch } = useUser();
  const submitInterests = useSubmitOnboardingInterests();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSubmitting = submitInterests.isPending;

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

    try {
      await submitInterests.mutateAsync({ tag_ids: selectedTags });
      await refetch();
      window.location.reload();
    } catch (error) {
      const apiError = error as { code?: string };
      if (apiError.code === "invalid_onboarding_step") {
        await refetch();
        window.location.reload();
        return;
      }
      setErrorMessage("Impossible d'enregistrer les intérêts. Réessaie dans un instant.");
    }
  };

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
