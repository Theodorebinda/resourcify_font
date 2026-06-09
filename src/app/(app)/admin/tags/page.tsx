/**
 * Admin Tags Page
 * 
 * Gestion des tags avec CRUD complet et fonctionnalité de fusion
 */

"use client";

import { useState } from "react";
import { 
  useAdminTags, 
  useCreateTag, 
  useUpdateTag, 
  useDeleteTag, 
  useMergeTags 
} from "../../../../services/api/queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Skeleton } from "../../../../components/ui/skeleton";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "../../../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { useToast } from "../../../../hooks/use-toast";
import { Tags, Plus, Search, Edit, Trash2, Merge } from "lucide-react";
import { Badge } from "../../../../components/ui/badge";

export default function AdminTagsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [tagName, setTagName] = useState("");
  const [selectedTag, setSelectedTag] = useState<{ id: string; name: string } | null>(null);
  const [sourceTagId, setSourceTagId] = useState("");
  const [targetTagId, setTargetTagId] = useState("");

  const { data: tagsData, isLoading } = useAdminTags(search, page, 20);
  const createTagMutation = useCreateTag();
  const updateTagMutation = useUpdateTag();
  const deleteTagMutation = useDeleteTag();
  const mergeTagsMutation = useMergeTags();
  const { toast } = useToast();

  const handleCreateTag = async () => {
    if (!tagName.trim()) return;
    
    try {
      await createTagMutation.mutateAsync({ name: tagName.trim() });
      toast({
        title: "Tag créé",
        description: `Le tag "${tagName}" a été créé avec succès.`,
      });
      setCreateDialogOpen(false);
      setTagName("");
    } catch (error) {
      const apiError = error as { message?: string };
      toast({
        title: "Erreur",
        description: apiError.message || "Impossible de créer le tag",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTag = async () => {
    if (!selectedTag || !tagName.trim()) return;
    
    try {
      await updateTagMutation.mutateAsync({
        id: selectedTag.id,
        name: tagName.trim(),
      });
      toast({
        title: "Tag modifié",
        description: `Le tag a été modifié avec succès.`,
      });
      setEditDialogOpen(false);
      setSelectedTag(null);
      setTagName("");
    } catch (error) {
      const apiError = error as { message?: string };
      toast({
        title: "Erreur",
        description: apiError.message || "Impossible de modifier le tag",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTag = async (tagId: string, tagName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le tag "${tagName}" ?`)) return;
    
    try {
      await deleteTagMutation.mutateAsync(tagId);
      toast({
        title: "Tag supprimé",
        description: "Le tag a été supprimé avec succès.",
      });
    } catch (error) {
      const apiError = error as { message?: string };
      toast({
        title: "Erreur",
        description: apiError.message || "Impossible de supprimer le tag",
        variant: "destructive",
      });
    }
  };

  const handleMergeTags = async () => {
    if (!sourceTagId || !targetTagId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un tag source et un tag cible.",
        variant: "destructive",
      });
      return;
    }

    if (sourceTagId === targetTagId) {
      toast({
        title: "Erreur",
        description: "Le tag source et le tag cible doivent être différents.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await mergeTagsMutation.mutateAsync({
        source_tag_id: sourceTagId,
        target_tag_id: targetTagId,
      });
      toast({
        title: "Tags fusionnés",
        description: "Les tags ont été fusionnés avec succès.",
      });
      setMergeDialogOpen(false);
      setSourceTagId("");
      setTargetTagId("");
    } catch (error) {
      const apiError = error as { message?: string };
      toast({
        title: "Erreur",
        description: apiError.message || "Impossible de fusionner les tags",
        variant: "destructive",
      });
    }
  };

  // Réinitialiser le tag cible si le tag source change
  const handleSourceTagChange = (value: string) => {
    setSourceTagId(value);
    // Si le tag cible est le même que le nouveau tag source, le réinitialiser
    if (value === targetTagId) {
      setTargetTagId("");
    }
  };

  // Tags disponibles pour les selects (exclure les tags déjà sélectionnés)
  const availableTags = tagsData?.results || [];
  const availableTargetTags = availableTags.filter(tag => tag.id !== sourceTagId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des tags</h1>
          <p className="text-muted-foreground">
            Gérez les tags de la plateforme
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Créer un tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un nouveau tag</DialogTitle>
              <DialogDescription>
                Entrez le nom du tag. Le slug sera généré automatiquement.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="Nom du tag"
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateTag()}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Annuler
              </Button>
              <Button
                onClick={handleCreateTag}
                disabled={!tagName.trim() || createTagMutation.isPending}
              >
                {createTagMutation.isPending ? "Création..." : "Créer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Dialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Merge className="mr-2 h-4 w-4" />
              Fusionner des tags
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Fusionner des tags</DialogTitle>
              <DialogDescription>
                Sélectionnez le tag source et le tag cible. Le tag source sera fusionné dans le tag cible.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Tag source <span className="text-muted-foreground">(sera fusionné dans le tag cible)</span>
                </label>
                <Select
                  value={sourceTagId}
                  onValueChange={handleSourceTagChange}
                  disabled={isLoading || availableTags.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un tag source" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTags.length === 0 ? (
                      <SelectItem value="no-tags" disabled>
                        Aucun tag disponible
                      </SelectItem>
                    ) : (
                      availableTags.map((tag) => (
                        <SelectItem key={tag.id} value={tag.id}>
                          {tag.name} <span className="text-muted-foreground">({tag.slug})</span>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {sourceTagId && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Le tag sélectionné sera fusionné dans le tag cible et supprimé.
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Tag cible <span className="text-muted-foreground">(recevra les associations du tag source)</span>
                </label>
                <Select
                  value={targetTagId}
                  onValueChange={setTargetTagId}
                  disabled={isLoading || availableTargetTags.length === 0 || !sourceTagId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={sourceTagId ? "Sélectionner un tag cible" : "Sélectionnez d&apos;abord un tag source"} />
                  </SelectTrigger>
                  <SelectContent>
                    {!sourceTagId ? (
                      <SelectItem value="no-source" disabled>
                        Sélectionnez d&apos;abord un tag source
                      </SelectItem>
                    ) : availableTargetTags.length === 0 ? (
                      <SelectItem value="no-tags" disabled>
                        Aucun tag disponible
                      </SelectItem>
                    ) : (
                      availableTargetTags.map((tag) => (
                        <SelectItem key={tag.id} value={tag.id}>
                          {tag.name} <span className="text-muted-foreground">({tag.slug})</span>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {targetTagId && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Ce tag recevra toutes les associations du tag source.
                  </p>
                )}
              </div>
              {sourceTagId && targetTagId && sourceTagId !== targetTagId && (
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-sm font-medium mb-1">Résumé de la fusion :</p>
                  <p className="text-xs text-muted-foreground">
                    Le tag <strong>{availableTags.find(t => t.id === sourceTagId)?.name}</strong> sera fusionné dans{" "}
                    <strong>{availableTags.find(t => t.id === targetTagId)?.name}</strong>.
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setMergeDialogOpen(false)}>
                Annuler
              </Button>
              <Button
                onClick={handleMergeTags}
                disabled={!sourceTagId || !targetTagId || mergeTagsMutation.isPending}
              >
                {mergeTagsMutation.isPending ? "Fusion..." : "Fusionner"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    
      </div>

      {/* Tags Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des tags</CardTitle>
          <CardDescription>
            {tagsData?.count ?? 0} tag(s) au total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : tagsData && tagsData.results.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tagsData.results.map((tag) => (
                  <div
                    key={tag.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Badge variant="outline" className="mb-2">
                          {tag.name}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Slug: {tag.slug}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Créé le {new Date(tag.created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTag({ id: tag.id, name: tag.name });
                            setTagName(tag.name);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTag(tag.id, tag.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {tagsData.count > 20 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {page} sur {Math.ceil(tagsData.count / 20)}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={!tagsData.next}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Tags className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun tag trouvé</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le tag</DialogTitle>
            <DialogDescription>
              Modifiez le nom du tag. Le slug sera mis à jour automatiquement.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Nom du tag"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUpdateTag()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleUpdateTag}
              disabled={!tagName.trim() || updateTagMutation.isPending}
            >
              {updateTagMutation.isPending ? "Modification..." : "Modifier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
