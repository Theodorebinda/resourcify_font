/**
 * Resource List Component
 * Affiche la liste des ressources (feed)
 */

"use client";

import { useResourceFeed } from "../../../services/api/queries/resources-queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Skeleton } from "../../ui/skeleton";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { Badge } from "../../ui/badge";
import { MessageCircle, Lock, Crown } from "lucide-react";
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

export function ResourceList() {
  const { data: resources, isLoading, error } = useResourceFeed(1, 20);

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

  if (!resources || resources.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <p>Aucune ressource disponible</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {resources.map((resource) => (
        <Card key={resource.id} className="hover:bg-muted/50 transition-colors">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {resource.author_name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{resource.author_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(new Date())}
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
            <div className="flex flex-wrap gap-2 mb-3">
              {resource.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                <span>{resource.stats.comment_count}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
