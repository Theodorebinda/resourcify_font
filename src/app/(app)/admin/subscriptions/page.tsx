/**
 * Admin Subscriptions Page
 * 
 * Gestion des abonnements avec liste, filtres et actions
 */

"use client";

import { useState } from "react";
import { useAdminSubscriptions, useCancelAdminSubscription } from "../../../../services/api/queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Skeleton } from "../../../../components/ui/skeleton";
import { useToast } from "../../../../hooks/use-toast";
import { CreditCard, X } from "lucide-react";

export default function AdminSubscriptionsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<{
    status?: string;
    plan?: string;
  }>({});

  const { data: subscriptionsData, isLoading, error: subscriptionsError } = useAdminSubscriptions(filters, page, 20);
  const cancelSubscriptionMutation = useCancelAdminSubscription();
  const { toast } = useToast();

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir annuler cet abonnement ?")) return;
    
    try {
      await cancelSubscriptionMutation.mutateAsync(subscriptionId);
      toast({
        title: "Abonnement annulé",
        description: "L&apos;abonnement a été annulé avec succès.",
      });
    } catch (error) {
      const apiError = error as { message?: string };
      toast({
        title: "Erreur",
        description: apiError.message || "Impossible d&apos;annuler l&apos;abonnement",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "default";
      case "canceled":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des abonnements</h1>
        <p className="text-muted-foreground">
          Gérez les abonnements de la plateforme
        </p>
      </div>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des abonnements</CardTitle>
          <CardDescription>
            {subscriptionsData?.count ?? 0} abonnement(s) au total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : subscriptionsError ? (
            <div className="text-center py-8 text-destructive">
              <p className="font-medium">Erreur lors du chargement</p>
              <p className="text-sm text-muted-foreground mt-2">
                {subscriptionsError.message || "Impossible de charger les abonnements"}
              </p>
            </div>
          ) : subscriptionsData && Array.isArray(subscriptionsData.results) && subscriptionsData.results.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 text-sm font-medium">Utilisateur</th>
                      <th className="text-left p-4 text-sm font-medium">Plan</th>
                      <th className="text-left p-4 text-sm font-medium">Statut</th>
                      <th className="text-left p-4 text-sm font-medium">Début</th>
                      <th className="text-left p-4 text-sm font-medium">Fin</th>
                      <th className="text-right p-4 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptionsData.results.map((subscription) => (
                      <tr key={subscription.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div className="font-medium">{subscription.user_email}</div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{subscription.plan}</Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant={getStatusBadgeVariant(subscription.status)}>
                            {subscription.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {new Date(subscription.started_at).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {subscription.ends_at
                            ? new Date(subscription.ends_at).toLocaleDateString("fr-FR")
                            : "-"}
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end">
                            {subscription.status === "active" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCancelSubscription(subscription.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {subscriptionsData.count > 20 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {page} sur {Math.ceil(subscriptionsData.count / 20)}
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
                      disabled={!subscriptionsData.next}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun abonnement trouvé</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
