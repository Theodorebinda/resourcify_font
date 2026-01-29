/**
 * Admin Dashboard Page
 * 
 * Vue d'ensemble de l'administration avec statistiques et activité récente
 */

"use client";

import { useDashboardOverview, useDashboardActivity, useSystemHealth } from "../../../../services/api/queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Skeleton } from "../../../../components/ui/skeleton";
import { AlertCircle, CheckCircle2, TrendingUp, Users, FileText, CreditCard, DollarSign } from "lucide-react";
import { cn } from "../../../../libs/utils";

export default function AdminDashboardPage() {
  const { data: overview, isLoading: overviewLoading, error: overviewError } = useDashboardOverview();
  const { data: activity, isLoading: activityLoading } = useDashboardActivity(10);
  const { data: health, isLoading: healthLoading } = useSystemHealth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Vue d&apos;ensemble de la plateforme Ressourcefy
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs totaux</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {overviewLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : overviewError ? (
              <p className="text-sm text-destructive">Erreur</p>
            ) : (
              <>
                <div className="text-2xl font-bold">{overview?.total_users ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                  {overview?.active_users ?? 0} actifs
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ressources</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {overviewLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : overviewError ? (
              <p className="text-sm text-destructive">Erreur</p>
            ) : (
              <>
                <div className="text-2xl font-bold">{overview?.total_resources ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                  {overview?.public_resources ?? 0} publiques, {overview?.premium_resources ?? 0} premium
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abonnements</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {overviewLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : overviewError ? (
              <p className="text-sm text-destructive">Erreur</p>
            ) : (
              <>
                <div className="text-2xl font-bold">{overview?.total_subscriptions ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                  {overview?.active_premium_subscriptions ?? 0} premium actifs
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {overviewLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : overviewError ? (
              <p className="text-sm text-destructive">Erreur</p>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  ${overview?.total_revenue_usd?.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "0.00"}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Revenus cumulés
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>Santé du système</CardTitle>
            <CardDescription>État de la base de données et de l&apos;outbox</CardDescription>
          </CardHeader>
          <CardContent>
            {healthLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : health ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Base de données</span>
                  {health.db_status === "ok" ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">OK</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Erreur</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Événements en attente</span>
                  <span className="text-sm font-medium">{health.outbox_pending_events}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Événements échoués</span>
                  <span className={cn(
                    "text-sm font-medium",
                    health.outbox_failed_events > 0 ? "text-red-600" : "text-green-600"
                  )}>
                    {health.outbox_failed_events}
                  </span>
                </div>
                {health.last_outbox_processed_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Dernier traitement</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(health.last_outbox_processed_at).toLocaleString("fr-FR")}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Aucune donnée disponible</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
            <CardDescription>Dernières actions sur la plateforme</CardDescription>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : activity && activity.activities.length > 0 ? (
              <div className="space-y-3">
                {activity.activities.slice(0, 5).map((act) => (
                  <div key={act.id} className="border-b pb-3 last:border-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{act.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {act.actor_email} • {act.action} • {act.entity_name}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                      {new Date(act.timestamp).toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Aucune activité récente</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
