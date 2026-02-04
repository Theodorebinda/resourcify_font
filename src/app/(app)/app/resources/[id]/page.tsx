/**
 * Resource Detail Page
 * 
 * Displays detailed information about a resource with comments and voting
 */

"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useResourceDetail } from "../../../../../services/api/queries/resources-queries";
import { useVoteOnComment, useCreateComment } from "../../../../../services/api/queries/comments-queries";
import { useUser } from "../../../../../services/api/queries/auth-queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../../components/ui/card";
import { Skeleton } from "../../../../../components/ui/skeleton";
import { SomethingWentWrong } from "../../../../../components/error/something-went-wrong";
import { useServerError } from "../../../../../hooks/use-server-error";
import { Avatar, AvatarFallback } from "../../../../../components/ui/avatar";
import { Badge } from "../../../../../components/ui/badge";
import { Button } from "../../../../../components/ui/button";
import { Textarea } from "../../../../../components/ui/textarea";
import { useToast } from "../../../../../hooks/use-toast";
import { ArrowLeft, Lock, Crown, MessageCircle, ThumbsUp, ThumbsDown, Download } from "lucide-react";
import { ROUTES } from "../../../../../constants/routes";

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

// Mock comment interface (à remplacer quand l'endpoint sera disponible)
interface Comment {
  id: string;
  author_name: string;
  author_avatar: string | null;
  content: string;
  created_at: string;
  vote_count: number;
  user_vote: 1 | -1 | null;
}

export default function ResourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const resourceId = params?.id as string;
  const { user } = useUser();
  const { toast } = useToast();
  const voteMutation = useVoteOnComment();
  const createCommentMutation = useCreateComment();
  const [commentContent, setCommentContent] = useState("");

  const { data: resource, isLoading, error } = useResourceDetail(resourceId);
  const serverErrorResult = useServerError(error, () => {});
  const isServerError = serverErrorResult?.isServerError ?? false;

  // Use comments from resource detail if available, otherwise empty array
  const comments: Comment[] = resource?.comments || [];

  const handleVote = async (commentId: string, voteValue: 1 | -1) => {
    try {
      await voteMutation.mutateAsync({
        comment_id: commentId,
        vote_value: voteValue,
      });
      toast({
        title: "Vote enregistré",
        description: "Votre vote a été enregistré avec succès.",
      });
    } catch (error) {
      const apiError = error as { message?: string };
      toast({
        title: "Erreur",
        description: apiError.message || "Impossible d'enregistrer le vote",
        variant: "destructive",
      });
    }
  };

  const handleCreateComment = async () => {
    if (!commentContent.trim()) {
      toast({
        title: "Erreur",
        description: "Le commentaire ne peut pas être vide",
        variant: "destructive",
      });
      return;
    }

    if (!resourceId) {
      toast({
        title: "Erreur",
        description: "Ressource introuvable",
        variant: "destructive",
      });
      return;
    }

    try {
      await createCommentMutation.mutateAsync({
        resource_id: resourceId,
        content: commentContent.trim(),
      });
      toast({
        title: "Commentaire ajouté",
        description: "Votre commentaire a été ajouté avec succès.",
      });
      setCommentContent("");
    } catch (error) {
      const apiError = error as { message?: string; code?: string };
      toast({
        title: "Erreur",
        description:
          apiError.message ||
          apiError.code === "access_denied"
            ? "Vous n'avez pas accès à cette ressource"
            : "Impossible d'ajouter le commentaire",
        variant: "destructive",
      });
    }
  };

  // Infrastructure error (5xx, network)
  if (isServerError) {
    return (
      <SomethingWentWrong
        message="We encountered an error loading the resource. Please try again."
        onRetry={serverErrorResult?.retry}
      />
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full mb-4" />
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state (business errors - 4xx)
  if (error) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.push(ROUTES.APP.DASHBOARD)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Erreur</CardTitle>
            <CardDescription>
              {error.message || "Impossible de charger la ressource"}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Empty state (no resource data)
  if (!resource) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.push(ROUTES.APP.DASHBOARD)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Ressource introuvable</CardTitle>
            <CardDescription>
              La ressource demandée n&apos;existe pas ou n&apos;est plus disponible.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Success state - render resource detail
  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push(ROUTES.APP.DASHBOARD)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour
      </Button>

      {/* Resource Detail Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
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
              <CardTitle className="text-2xl mb-2">{resource.title}</CardTitle>
              <div className="flex items-center gap-2 mb-2">
                {resource.visibility === "premium" && (
                  <Badge variant="secondary" className="gap-1">
                    <Crown className="h-3 w-3" />
                    Premium
                  </Badge>
                )}
                {resource.visibility === "private" && (
                  <Badge variant="secondary" className="gap-1">
                    <Lock className="h-3 w-3" />
                    Privé
                  </Badge>
                )}
                {resource.price_cents && (
                  <Badge variant="secondary">
                    {(resource.price_cents / 100).toFixed(2)} €
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {resource.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {resource.description}
            </p>
          </div>

          {/* Versions */}
          {resource.versions && resource.versions.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Versions disponibles</h3>
              <div className="space-y-2">
                {resource.versions.map((version) => (
                  <div
                    key={version.version_number}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
                  >
                    <div>
                      <p className="font-medium">
                        Version {version.version_number}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(new Date(version.created_at))}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(version.file_url, "_blank")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Commentaires
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Comment Form */}
          {user && (
            <div className="border-b border-border pb-4">
              <Textarea
                placeholder="Ajouter un commentaire..."
                className="min-h-[100px] mb-2"
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                disabled={createCommentMutation.isPending}
              />
              <Button
                onClick={handleCreateComment}
                disabled={!commentContent.trim() || createCommentMutation.isPending}
                className="w-full"
              >
                {createCommentMutation.isPending ? "Publication..." : "Commenter"}
              </Button>
            </div>
          )}

          {/* Comments List */}
          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex gap-3 p-4 rounded-lg border border-border bg-muted/30"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {comment.author_name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm">
                        {comment.author_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(new Date(comment.created_at))}
                      </p>
                    </div>
                    <p className="text-sm mb-2">{comment.content}</p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => handleVote(comment.id, 1)}
                        disabled={voteMutation.isPending}
                      >
                        <ThumbsUp
                          className={`h-3 w-3 mr-1 ${
                            comment.user_vote === 1 ? "text-primary" : ""
                          }`}
                        />
                        {comment.vote_count > 0 && comment.vote_count}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => handleVote(comment.id, -1)}
                        disabled={voteMutation.isPending}
                      >
                        <ThumbsDown
                          className={`h-3 w-3 mr-1 ${
                            comment.user_vote === -1 ? "text-primary" : ""
                          }`}
                        />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Aucun commentaire pour le moment</p>
              <p className="text-sm mt-1">
                Soyez le premier à commenter cette ressource
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
