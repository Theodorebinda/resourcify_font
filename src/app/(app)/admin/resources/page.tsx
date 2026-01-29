/**
 * Admin Resources Page
 * 
 * Gestion des ressources avec liste, filtres et actions admin
 */

"use client";

import { useState } from "react";
import { useAdminResources, useDeleteAdminResource } from "../../../../services/api/queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Badge } from "../../../../components/ui/badge";
import { Skeleton } from "../../../../components/ui/skeleton";
import { useToast } from "../../../../hooks/use-toast";
import { FileText, Search, Trash2, Eye } from "lucide-react";
import Link from "next/link";

export default function AdminResourcesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<{
    visibility?: "public" | "premium" | "private";
    has_price?: boolean;
  }>({});

  const { data: resourcesData, isLoading, error: resourcesError } = useAdminResources(filters, page, 20);
  const deleteResourceMutation = useDeleteAdminResource();
  const { toast } = useToast();

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
            placeholder="Rechercher par titre..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setFilters((f) => ({ ...f, search: e.target.value || undefined }));
            }}
            className="pl-9"
          />
        </div>
      </div>

      {/* Resources Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des ressources</CardTitle>
          <CardDescription>
            {resourcesData?.count ?? 0} ressource(s) au total
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
          ) : resourcesData && Array.isArray(resourcesData.results) && resourcesData.results.length > 0 ? (
            <>
              <div className="space-y-4">
                {resourcesData.results.map((resource) => (
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
                              ${(resource.price_cents / 100).toFixed(2)}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {resource.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Auteur: {resource.author_email}</span>
                          <span>
                            {resource.versions.length} version(s)
                          </span>
                          <span>
                            {resource.tags.length} tag(s)
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/resources/${resource.id}`}>
                            <Eye className="h-4 w-4" />
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
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {resourcesData.count > 20 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {page} sur {Math.ceil(resourcesData.count / 20)}
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
                      disabled={!resourcesData.next}
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
