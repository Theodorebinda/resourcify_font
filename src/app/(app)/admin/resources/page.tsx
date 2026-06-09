/**
 * Admin Resources Page
 * 
 * Gestion des ressources avec liste, filtres et actions admin
 */

"use client";

import { useState } from "react";
import { useDeleteAdminResource } from "../../../../services/api/queries";
import { useResourceFeed } from "../../../../services/api/queries/resources-queries";
import { useResourceUsersProgress } from "../../../../services/api/queries/progress-queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Badge } from "../../../../components/ui/badge";
import { Skeleton } from "../../../../components/ui/skeleton";
import { useToast } from "../../../../hooks/use-toast";
import { FileText, Search, Trash2, Eye, ChevronDown, ChevronUp, Users, CheckCircle, Clock, Play, History } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "../../../../components/ui/avatar";
import Image from "next/image";
import { ROUTES } from "../../../../constants/routes";

// Component pour afficher les suivis d'une ressource
function ResourceProgressSection({ resourceId }: { resourceId: string }) {
  const [page, setPage] = useState(1);
  const { data: progressData, isLoading, error } = useResourceUsersProgress(resourceId, page, 10);

  if (isLoading) {
    return (
      <div className="mt-4 space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 text-sm text-destructive">
        Erreur lors du chargement des suivis: {error.message}
      </div>
    );
  }

  if (!progressData || progressData.progress_entries.length === 0) {
    return (
      <div className="mt-4 text-sm text-muted-foreground text-center py-4">
        Aucun suivi pour cette ressource
      </div>
    );
  }

  // Calculer les statistiques sur la page actuelle
  // Note: Pour les statistiques globales exactes, il faudrait agréger toutes les pages
  const totalCompleted = progressData.progress_entries.filter((e) => e.status === "COMPLETED").length;
  const totalInProgress = progressData.progress_entries.filter((e) => e.status === "IN_PROGRESS").length;
  const totalNotStarted = progressData.progress_entries.filter((e) => e.status === "NOT_STARTED").length;

  return (
    <div className="mt-4 space-y-4">
      {/* Statistiques */}
      <div className="grid grid-cols-4 gap-4 p-3 bg-muted/30 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold">{progressData.pagination.total_count}</div>
          <div className="text-xs text-muted-foreground">Total utilisateurs</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {progressData.pagination.total_count > progressData.progress_entries.length
              ? `${totalCompleted}+`
              : totalCompleted}
          </div>
          <div className="text-xs text-muted-foreground">Complétés</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {progressData.pagination.total_count > progressData.progress_entries.length
              ? `${totalInProgress}+`
              : totalInProgress}
          </div>
          <div className="text-xs text-muted-foreground">En cours</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600">
            {progressData.pagination.total_count > progressData.progress_entries.length
              ? `${totalNotStarted}+`
              : totalNotStarted}
          </div>
          <div className="text-xs text-muted-foreground">Non démarrés</div>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div className="space-y-2">
        <h4 className="font-semibold text-sm">Utilisateurs ({progressData.pagination.total_count})</h4>
        {progressData.progress_entries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <Avatar className="h-8 w-8">
              {entry.avatar_url ? (
                <Image
                  src={entry.avatar_url}
                  alt={entry.username}
                  width={32}
                  height={32}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <AvatarFallback>
                  {entry.username?.slice(0, 2).toUpperCase() || entry.user_email.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {entry.username || entry.user_email}
              </p>
              <p className="text-xs text-muted-foreground truncate">{entry.user_email}</p>
            </div>
            <div className="flex items-center gap-2">
              {entry.status === "COMPLETED" && (
                <Badge variant="default" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Complété
                </Badge>
              )}
              {entry.status === "IN_PROGRESS" && (
                <Badge variant="secondary" className="gap-1">
                  <Clock className="h-3 w-3" />
                  En cours
                </Badge>
              )}
              {entry.status === "NOT_STARTED" && (
                <Badge variant="outline" className="gap-1">
                  <Play className="h-3 w-3" />
                  Non démarré
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground text-right">
              {entry.last_accessed_at && (
                <div>
                  Dernier accès: {new Date(entry.last_accessed_at).toLocaleDateString("fr-FR")}
                </div>
              )}
              {entry.completed_at && (
                <div className="text-green-600">
                  Complété: {new Date(entry.completed_at).toLocaleDateString("fr-FR")}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {progressData.pagination.total_pages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t">
          <p className="text-sm text-muted-foreground">
            Page {progressData.pagination.page} sur {progressData.pagination.total_pages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!progressData.pagination.has_previous}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(progressData.pagination.total_pages, p + 1))}
              disabled={!progressData.pagination.has_next}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminResourcesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [expandedResources, setExpandedResources] = useState<Set<string>>(new Set());

  // Utiliser useResourceFeed (route publique /feed/) au lieu de useAdminResources
  const { data: resources, isLoading, error: resourcesError } = useResourceFeed(page, 20);
  const deleteResourceMutation = useDeleteAdminResource();
  const { toast } = useToast();

  // Filtrer les ressources par recherche côté client (ou utiliser l'API avec search si disponible)
  const filteredResources = resources?.filter((resource) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      resource.title.toLowerCase().includes(searchLower) ||
      resource.author_name.toLowerCase().includes(searchLower) ||
      resource.tags.some((tag) => tag.toLowerCase().includes(searchLower))
    );
  }) || [];

  const toggleResourceProgress = (resourceId: string) => {
    setExpandedResources((prev) => {
      const next = new Set(prev);
      if (next.has(resourceId)) {
        next.delete(resourceId);
      } else {
        next.add(resourceId);
      }
      return next;
    });
  };

  const handleDeleteResource = async (resourceId: string, title: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la ressource "${title}" ?`)) return;
    
    try {
      await deleteResourceMutation.mutateAsync(resourceId);
      toast({
        title: "Ressource supprimée",
        description: "La ressource a été supprimée avec succès.",
      });
    } catch (error) {
      const apiError = error as { message?: string };
      toast({
        title: "Erreur",
        description: apiError.message || "Impossible de supprimer la ressource",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des ressources</h1>
        <p className="text-muted-foreground">
          Gérez toutes les ressources de la plateforme
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par titre, auteur ou tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Resources Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des ressources</CardTitle>
          <CardDescription>
            {filteredResources.length} ressource(s) {search ? "trouvée(s)" : "au total"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : resourcesError ? (
            <div className="text-center py-8 text-destructive">
              <p className="font-medium">Erreur lors du chargement</p>
              <p className="text-sm text-muted-foreground mt-2">
                {resourcesError.message || "Impossible de charger les ressources"}
              </p>
            </div>
          ) : filteredResources.length > 0 ? (
            <>
              <div className="space-y-4">
                {filteredResources.map((resource) => {
                  const isExpanded = expandedResources.has(resource.id);
                  return (
                    <div
                      key={resource.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{resource.title}</h3>
                            <Badge variant="outline">{resource.visibility}</Badge>
                            {resource.price_cents && (
                              <Badge variant="secondary">
                                {(resource.price_cents / 100).toFixed(2)} €
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                            <span>Auteur: {resource.author_name}</span>
                            <span>
                              {resource.stats.comment_count} commentaire(s)
                            </span>
                            <span>
                              {resource.stats.total_votes} vote(s)
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {resource.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleResourceProgress(resource.id)}
                            className="gap-1"
                          >
                            <Users className="h-4 w-4" />
                            Suivis
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/app/resources/${resource.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`${ROUTES.ADMIN.AUDIT}?table_name=resources_resource&row_id=${resource.id}`}>
                              <History className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteResource(resource.id, resource.title)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Section des suivis (expandable) */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t">
                          <ResourceProgressSection resourceId={resource.id} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {resources && resources.length >= 20 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {page}
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
                      disabled={!resources || resources.length < 20}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune ressource trouvée</p>
              {search && (
                <p className="text-sm mt-2">Essayez avec d&apos;autres mots-clés</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
