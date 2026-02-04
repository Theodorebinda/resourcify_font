/**
 * Create Resource Form Component
 * Style X/Twitter - Formulaire pour créer une ressource
 */

"use client";

import { useState } from "react";
import { useCreateResource } from "../../../services/api/queries/resources-queries";
import { useTags } from "../../../services/api/queries/tags-queries";
import { useUser } from "../../../services/api/queries/auth-queries";
import { useToast } from "../../../hooks/use-toast";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import { Input } from "../../ui/input";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { Image, Link2, FileText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Badge } from "../../ui/badge";

export function CreateResourceForm() {
  const { user } = useUser();
  const { toast } = useToast();
  const createResourceMutation = useCreateResource();
  const { data: tags = [], isLoading: tagsLoading } = useTags();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "premium" | "private">("public");
  const [priceCents, setPriceCents] = useState<string>("");
  const [fileUrl, setFileUrl] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Vérifier si l'utilisateur peut créer des ressources
  const canCreateResource =
    user?.role === "SUPERADMIN" ||
    user?.role === "ADMIN" ||
    user?.role === "MODERATOR" ||
    user?.role === "CONTRIBUTOR";

  if (!canCreateResource) {
    return null;
  }

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir le titre et la description.",
        variant: "destructive",
      });
      return;
    }

    if (visibility === "premium" && !fileUrl.trim()) {
      toast({
        title: "Erreur",
        description: "Les ressources premium nécessitent un fichier.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createResourceMutation.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        visibility,
        price_cents: priceCents ? Math.round(parseFloat(priceCents) * 100) : null,
        tag_ids: selectedTags,
        file_url: fileUrl.trim() || "",
      });

      toast({
        title: "Ressource créée",
        description: "Votre ressource a été créée avec succès.",
      });

      // Reset form
      setTitle("");
      setDescription("");
      setVisibility("public");
      setPriceCents("");
      setFileUrl("");
      setSelectedTags([]);
      setIsExpanded(false);
    } catch (error) {
      const apiError = error as { message?: string };
      toast({
        title: "Erreur",
        description: apiError.message || "Impossible de créer la ressource",
        variant: "destructive",
      });
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const isFormValid = title.trim().length > 0 && description.trim().length > 0;
  const isSubmitting = createResourceMutation.isPending;

  return (
    <div className="border-b border-border p-4">
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarFallback>
            {user?.username
              ? user.username.slice(0, 2).toUpperCase()
              : user?.email.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Form Content */}
        <div className="flex-1 space-y-4">
          {/* Title Input */}
          <Input
            placeholder="Titre de la ressource..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            className="border-0 bg-transparent text-lg placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
          />

          {/* Description Textarea */}
          {isExpanded && (
            <>
              <Textarea
                placeholder="Description de la ressource..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px] resize-none border-0 bg-transparent text-base placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
              />

              {/* File URL Input */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Link2 className="h-4 w-4" />
                  <span>URL du fichier (optionnel)</span>
                </div>
                <Input
                  placeholder="https://..."
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="text-sm"
                />
              </div>

              {/* Visibility and Price */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Visibilité</label>
                  <Select value={visibility} onValueChange={(value: "public" | "premium" | "private") => setVisibility(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="private">Privé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {visibility === "premium" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Prix (€)</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={priceCents}
                      onChange={(e) => setPriceCents(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Tags Selection */}
              {!tagsLoading && tags.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleTag(tag.id)}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-4 text-muted-foreground">
              <button
                type="button"
                className="rounded-full p-2 hover:bg-muted transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <Image className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="rounded-full p-2 hover:bg-muted transition-colors"
              >
                <FileText className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {isExpanded && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsExpanded(false);
                    setTitle("");
                    setDescription("");
                    setVisibility("public");
                    setPriceCents("");
                    setFileUrl("");
                    setSelectedTags([]);
                  }}
                >
                  Annuler
                </Button>
              )}
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid || isSubmitting}
                className="rounded-full px-6"
              >
                {isSubmitting ? "Publication..." : "Publier"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
