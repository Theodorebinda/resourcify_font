"use client";

import { useRouter } from "next/navigation";
import { useResourceFeed } from "../../../services/api/queries/resources-queries";
import { ROUTES } from "../../../constants/routes";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../ui/card";
import { Skeleton } from "../../ui/skeleton";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { Badge } from "../../ui/badge";
import { MessageCircle, Lock, Crown, ThumbsUp, ThumbsDown, Share2, MoreHorizontal } from "lucide-react";

export function ResourceList() {
  const router = useRouter();
  const { data: resources, isLoading, error } = useResourceFeed(1, 20);

  console.log({ resources });

  if (isLoading) {
    return (
      <div className="space-y-0 divide-y border rounded-md">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="flex justify-between">
                   <Skeleton className="h-4 w-32" />
                   <Skeleton className="h-4 w-10" />
                </div>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-600">Erreur</CardTitle>
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
        <CardContent className="py-12 text-center text-muted-foreground">
          <p>Aucune ressource disponible pour le moment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    // Container principal style "Feed" : Bordure unique, séparation par ligne
    <div className="border rounded-md bg-card divide-y">
      {resources.map((resource) => (
        <div 
          key={resource.id} 
          className="p-4 hover:bg-muted/30 transition-colors group cursor-pointer"
          onClick={() => router.push(ROUTES.APP.RESOURCE_DETAIL(resource.id))}
        >
          <div className="flex gap-3 sm:gap-4">
         
            <div className="shrink-0">
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border">
                <AvatarFallback className="font-bold bg-muted text-muted-foreground">
                  {resource.author_name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Colonne Droite : Contenu */}
            <div className="flex-1 min-w-0">
              
              {/* Header du post (Auteur + Métadonnées) */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="font-bold text-base truncate text-foreground">
                    {resource.author_name}
                  </span>
                  
                  {/* Badges de visibilité intégrés comme des "Verified/Status" */}
                  <div className="flex items-center gap-1 text-muted-foreground shrink-0">
                    <span className="text-muted-foreground/40 text-sm">•</span>
                    {resource.visibility === "premium" && (
                      <Crown className="h-3.5 w-3.5 text-yellow-500" aria-label="Premium" />
                    )}
                    {resource.visibility === "private" && (
                      <Lock className="h-3.5 w-3.5" aria-label="Privé" />
                    )}
                    {resource.price_cents && (
                      <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
                        {(resource.price_cents / 100).toFixed(2)} €
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Menu 3 points (décoratif ici pour matcher le look) */}
                <button className="text-muted-foreground/50 hover:text-foreground transition-colors">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>

              {/* Corps du post */}
              <div className="mb-3">
                <h3 className="text-base sm:text-lg leading-snug text-foreground whitespace-pre-wrap mb-2">
                  {resource.title}
                </h3>
                
                {/* Tags style Hashtags bleus */}
                {resource.tags && resource.tags.length > 0 && (
                  <div className="flex flex-wrap gap-x-2 gap-y-0 mb-3">
                    {resource.tags.map((tag) => (
                      <span key={tag} className="text-blue-500 hover:underline text-sm sm:text-base">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Zone d'image (Placeholder pour respecter le design, même si on a pas l'URL image dans les props actuelles) */}
              {/* Si tu avais une image dans `resource`, elle irait ici avec un aspect-ratio rounded-xl border */}
              
              {/* Barre d'action (Footer) */}
              <div className="flex items-center justify-between mt-3 max-w-md text-muted-foreground">
                
                {/* Commentaires */}
                <div className="flex items-center gap-1.5 group/action hover:text-blue-500 transition-colors" title="Commentaires">
                  <div className="p-1.5 rounded-full group-hover/action:bg-blue-500/10 transition-colors">
                    <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <span className="text-xs sm:text-sm tabular-nums">
                    {resource.stats.comment_count > 0 && resource.stats.comment_count}
                  </span>
                </div>

                {/* Upvote */}
                <div className="flex items-center gap-1.5 group/action hover:text-green-500 transition-colors" title="J'aime">
                  <div className="p-1.5 rounded-full group-hover/action:bg-green-500/10 transition-colors">
                    <ThumbsUp className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <span className="text-xs sm:text-sm tabular-nums">
                    {resource.stats.upvotes > 0 && resource.stats.upvotes}
                  </span>
                </div>

                 {/* Downvote */}
                 <div className="flex items-center gap-1.5 group/action hover:text-red-500 transition-colors" title="Je n'aime pas">
                  <div className="p-1.5 rounded-full group-hover/action:bg-red-500/10 transition-colors">
                    <ThumbsDown className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <span className="text-xs sm:text-sm tabular-nums">
                    {resource.stats.downvotes > 0 && resource.stats.downvotes}
                  </span>
                </div>

                {/* Share (Ajouté pour l'équilibre visuel du design tweet) */}
                <div className="flex items-center gap-1.5 group/action hover:text-blue-500 transition-colors">
                  <div className="p-1.5 rounded-full group-hover/action:bg-blue-500/10 transition-colors">
                    <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}