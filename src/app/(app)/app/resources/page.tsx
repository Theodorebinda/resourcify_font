/**
 * Resources Page with Tabs
 * 
 * Displays resources in two tabs:
 * - All resources
 * - Followed resources (resources the user is tracking)
 * 
 * Accessible to all roles except USER
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../../../services/api/queries/auth-queries";
import { useUserResources, type UserResourceItem } from "../../../../services/api/queries/resources-queries";
import { useUserProgress } from "../../../../services/api/queries/progress-queries";
import { ROUTES } from "../../../../constants/routes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Skeleton } from "../../../../components/ui/skeleton";
import { Avatar, AvatarFallback } from "../../../../components/ui/avatar";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { MessageCircle, Lock, Crown, ThumbsUp, ThumbsDown, FileText } from "lucide-react";
import Image from "next/image";

const STORAGE_KEY = "resources-tab-selection";

type TabType = "all" | "followed";

// Format date helper
function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7) return `Il y a ${days}j`;
  return date.toLocaleDateString("fr-FR");
}

// Resource Card Component
function ResourceCard({ resource }: { resource: UserResourceItem }) {
  const router = useRouter();

  return (
    <Card
      className="hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={() => router.push(ROUTES.APP.RESOURCE_DETAIL(resource.id))}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>MR</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">Mes ressources</p>
              <p className="text-sm text-muted-foreground">
                {resource.created_at ? formatDate(new Date(resource.created_at)) : "Date inconnue"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {resource.visibility === "premium" && (
              <Crown className="h-4 w-4 text-yellow-500" />
            )}
            {resource.visibility === "private" && (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
            {resource.price_cents && (
              <Badge variant="secondary">
                {(resource.price_cents / 100).toFixed(2)} €
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardTitle className="mb-2">{resource.title}</CardTitle>
        {resource.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {resource.description}
          </p>
        )}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {resource.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        {resource.stats && (
          <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                <span>{resource.stats.comment_count || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <ThumbsUp className="h-4 w-4" />
                <span>{resource.stats.upvotes || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <ThumbsDown className="h-4 w-4" />
                <span>{resource.stats.downvotes || 0}</span>
              </div>
            </div>
            {resource.stats.total_votes > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-xs">
                  {resource.stats.total_votes} vote
                  {resource.stats.total_votes > 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// All Resources Tab Content
function AllResourcesTab() {
  const { data: resourcesData, isLoading, error } = useUserResources(1, 20);
  const resources: UserResourceItem[] = resourcesData?.data || [];

  console.log({resourcesData});

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Erreur</CardTitle>
          <CardDescription>
            {error.message || "Impossible de charger les ressources"}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  console.log({resources});

  if (!resources || resources.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Vous n&apos;avez créé aucune ressource</p>
          <p className="text-sm mt-2">
            Créez votre première ressource pour commencer
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {resources.map((resource) => (
        <ResourceCard key={resource.id} resource={resource} />
      ))}
    </div>
  );
}

// Followed Resources Tab Content
function FollowedResourcesTab() {
  const { data: progressData, isLoading, error } = useUserProgress(1, 50);
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Erreur</CardTitle>
          <CardDescription>
            {error.message || "Impossible de charger vos ressources suivies"}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!progressData || progressData.data.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Vous ne suivez aucune ressource pour le moment</p>
          <p className="text-sm mt-2">
            Accédez à une ressource pour commencer à la suivre
          </p>
        </CardContent>
      </Card>
    );
  }

  // Convert progress items to resource-like format for display
  interface FollowedResource {
    id: string;
    title: string;
    author_name: string;
    author_avatar: string | null;
    status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
    last_accessed_at: string | null;
    completed_at: string | null;
  }

  const followedResources: FollowedResource[] = progressData.data.map((progress) => ({
    id: progress.resource_id,
    title: progress.resource_title,
    author_name: progress.author_name,
    author_avatar: progress.author_avatar,
    status: progress.status,
    last_accessed_at: progress.last_accessed_at,
    completed_at: progress.completed_at,
  }));

  return (
    <div className="space-y-4">
      {/* Summary Statistics */}
      {progressData.summary && (
        <Card>
          <CardHeader>
            <CardTitle>Statistiques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{progressData.summary.total_resources}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {progressData.summary.completed_count}
                </div>
                <div className="text-xs text-muted-foreground">Complétés</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {progressData.summary.in_progress_count}
                </div>
                <div className="text-xs text-muted-foreground">En cours</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {progressData.summary.not_started_count}
                </div>
                <div className="text-xs text-muted-foreground">Non démarrés</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Followed Resources List */}
      {followedResources.map((resource) => (
        <Card
          key={resource.id}
          className="hover:bg-muted/50 transition-colors cursor-pointer"
          onClick={() => router.push(ROUTES.APP.RESOURCE_DETAIL(resource.id))}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  {resource.author_avatar ? (
                    <Image
                      src={resource.author_avatar}
                      alt={resource.author_name}
                      width={40}
                      height={40}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <AvatarFallback>
                      {resource.author_name?.slice(0, 2).toUpperCase() || "??"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="font-semibold">{resource.author_name || "Auteur inconnu"}</p>
                  <p className="text-sm text-muted-foreground">
                    {resource.last_accessed_at
                      ? `Dernier accès: ${formatDate(new Date(resource.last_accessed_at))}`
                      : "Jamais accédé"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {resource.status === "COMPLETED" && (
                  <Badge variant="default">Complété</Badge>
                )}
                {resource.status === "IN_PROGRESS" && (
                  <Badge variant="secondary">En cours</Badge>
                )}
                {resource.status === "NOT_STARTED" && (
                  <Badge variant="outline">Non démarré</Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="mb-2">{resource.title}</CardTitle>
            {resource.completed_at && (
              <p className="text-sm text-muted-foreground">
                Complété le {new Date(resource.completed_at).toLocaleDateString("fr-FR")}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function ResourcesPage() {
  const { user, isLoading: isLoadingUser } = useUser();
  
  // Déterminer si l'utilisateur peut voir l'onglet "Toutes les ressources"
  const canViewAllResources = user?.role && 
    ["SUPERADMIN", "ADMIN", "MODERATOR", "CONTRIBUTOR"].includes(user.role);
  
  // Pour les USER, forcer l'onglet "followed"
  // Pour les autres, charger depuis localStorage
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (canViewAllResources) {
      return "all";
    }
    return "followed";
  });

  // Load tab selection from localStorage on mount (seulement pour les non-USER)
  useEffect(() => {
    if (typeof window !== "undefined" && canViewAllResources) {
      const savedTab = localStorage.getItem(STORAGE_KEY) as TabType | null;
      if (savedTab === "all" || savedTab === "followed") {
        setActiveTab(savedTab);
      }
    } else if (!canViewAllResources) {
      // Forcer l'onglet "followed" pour les USER
      setActiveTab("followed");
    }
  }, [canViewAllResources]);

  // Save tab selection to localStorage when it changes (seulement pour les non-USER)
  useEffect(() => {
    if (typeof window !== "undefined" && canViewAllResources) {
      localStorage.setItem(STORAGE_KEY, activeTab);
    }
  }, [activeTab, canViewAllResources]);
  
  // Empêcher les USER de changer d'onglet vers "all"
  useEffect(() => {
    if (!canViewAllResources && activeTab === "all") {
      setActiveTab("followed");
    }
  }, [canViewAllResources, activeTab]);

  if (isLoadingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirection en cours
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ressources</h1>
        <p className="text-muted-foreground">
          {canViewAllResources
            ? "Parcourez toutes les ressources ou consultez celles que vous suivez"
            : "Consultez les ressources que vous suivez"}
        </p>
      </div>

      {/* Tabs - Afficher seulement si l'utilisateur peut voir les deux onglets */}
      {canViewAllResources && (
        <div className="border-b">
          <div className="flex gap-4">
            <Button
              variant="ghost"
              onClick={() => setActiveTab("all")}
              className={activeTab === "all" ? "border-b-2 border-primary rounded-none" : ""}
            >
              Toutes les ressources
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab("followed")}
              className={activeTab === "followed" ? "border-b-2 border-primary rounded-none" : ""}
            >
              Ressources suivies
            </Button>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="mt-6">
        {canViewAllResources && activeTab === "all" && <AllResourcesTab />}
        {activeTab === "followed" && <FollowedResourcesTab />}
      </div>
    </div>
  );
}
