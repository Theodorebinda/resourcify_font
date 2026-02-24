/**
 * Admin Audit Page
 *
 * Consultation d'historique d'audit par table + row_id, avec restauration.
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  useAdminPaymentDetail,
  useAdminResourceDetail,
  useAdminSubscriptionDetail,
  useAdminTagDetail,
  useAdminUserDetail,
  useAuditEntry,
  useAuditList,
  useAuditHistory,
  useAuditUsersByIds,
  useRestoreAuditEntry,
  isSupportedRestoreAction,
  toNumericAuditId,
  type AuditResolvedUser,
  type AuditHistoryItem,
} from "../../../../services/api/queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Badge } from "../../../../components/ui/badge";
import { Skeleton } from "../../../../components/ui/skeleton";
import { Textarea } from "../../../../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { useToast } from "../../../../hooks/use-toast";
import { Eye, History, Loader2, RotateCcw, Search } from "lucide-react";

type SupportedEntityType = "resource" | "user" | "tag" | "subscription" | "payment" | null;

const TABLE_SUGGESTIONS = [
  { label: "Ressources", value: "resources_resource" },
  { label: "Utilisateurs", value: "users_user" },
  { label: "Tags", value: "core_tag" },
  { label: "Abonnements", value: "monetization_subscription" },
  { label: "Paiements", value: "monetization_payment" },
] as const;

function inferEntityType(tableName: string): SupportedEntityType {
  const normalized = tableName.trim().toLowerCase();
  if (!normalized) return null;
  if (normalized.includes("resource")) return "resource";
  if (normalized.includes("user")) return "user";
  if (normalized.includes("tag")) return "tag";
  if (normalized.includes("subscription")) return "subscription";
  if (normalized.includes("payment")) return "payment";
  return null;
}

function formatDate(value: string): string {
  if (!value) return "Date inconnue";
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return value;
  return parsedDate.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function toTimestamp(value: string): number {
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? Number.MAX_SAFE_INTEGER : timestamp;
}

function formatJson(value: unknown): string {
  if (value === undefined || value === null) return "Aucune donnée";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function humanizeTableName(tableName: string): string {
  const normalized = tableName.trim().toLowerCase();
  if (!normalized) return "Entité";
  if (normalized.includes("users_user")) return "Utilisateur";
  if (normalized.includes("resources_resource")) return "Ressource";
  if (normalized.includes("progress_userresourceprogress")) return "Progression";
  if (normalized.includes("interactions_resourcevote")) return "Vote ressource";
  if (normalized.includes("core_tag")) return "Tag";
  if (normalized.includes("subscription")) return "Abonnement";
  if (normalized.includes("payment")) return "Paiement";
  return tableName;
}

function formatActionLabel(action: string): string {
  const normalizedAction = action.toUpperCase();
  if (normalizedAction === "INSERT") return "Création";
  if (normalizedAction === "UPDATE") return "Mise à jour";
  if (normalizedAction === "DELETE") return "Suppression";
  return normalizedAction || "Action inconnue";
}

function getActionBadgeVariant(action: string): "default" | "secondary" | "destructive" | "outline" {
  const normalizedAction = action.toUpperCase();
  if (normalizedAction === "INSERT") return "default";
  if (normalizedAction === "UPDATE") return "secondary";
  if (normalizedAction === "DELETE") return "destructive";
  return "outline";
}

function extractOldestVisibleEntry(entries: AuditHistoryItem[]): AuditHistoryItem | null {
  if (entries.length === 0) return null;

  const sortedEntries = [...entries].sort((a, b) => toTimestamp(a.timestamp) - toTimestamp(b.timestamp));
  return sortedEntries[0] ?? null;
}

function extractOldestRestorableEntry(entries: AuditHistoryItem[]): AuditHistoryItem | null {
  if (entries.length === 0) return null;

  const sortedEntries = [...entries].sort((a, b) => toTimestamp(a.timestamp) - toTimestamp(b.timestamp));
  return sortedEntries.find((entry) => isSupportedRestoreAction(entry.action)) ?? null;
}

function formatResolvedUserLabel(user: AuditResolvedUser, fallbackId: string): string {
  const usernameChunk = user.username ? ` (@${user.username})` : "";
  const roleChunk = user.role ? ` • ${user.role}` : "";
  const emailChunk = user.email || "Utilisateur";
  return `${emailChunk}${usernameChunk}${roleChunk} [${fallbackId}]`;
}

function formatDiffValue(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function isUuid(value: string): boolean {
  const uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(value);
}

export default function AdminAuditPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [tableName, setTableName] = useState("");
  const [rowId, setRowId] = useState("");
  const [activeTableName, setActiveTableName] = useState("");
  const [activeRowId, setActiveRowId] = useState("");
  const [page, setPage] = useState(1);
  const [initializedFromQuery, setInitializedFromQuery] = useState(false);

  const [selectedAuditId, setSelectedAuditId] = useState<number | string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [restoreReason, setRestoreReason] = useState("");
  const [restoreTarget, setRestoreTarget] = useState<{ auditId: number; label: string } | null>(null);
  const [globalOperationFilter, setGlobalOperationFilter] = useState<
    "ALL" | "INSERT" | "UPDATE" | "DELETE"
  >(
    "ALL"
  );
  const canSearch = tableName.trim().length > 0 && rowId.trim().length > 0;
  const hasActiveSearch = activeTableName.trim().length > 0 && activeRowId.trim().length > 0;

  useEffect(() => {
    if (initializedFromQuery) return;

    const tableParam = searchParams?.get("table_name") ?? searchParams?.get("table");
    const rowIdParam = searchParams?.get("row_id") ?? searchParams?.get("id");

    if (tableParam && rowIdParam) {
      setTableName(tableParam);
      setRowId(rowIdParam);
      setActiveTableName(tableParam);
      setActiveRowId(rowIdParam);
    }

    setInitializedFromQuery(true);
  }, [initializedFromQuery, searchParams]);

  const historyQuery = useAuditHistory(activeTableName, activeRowId, page, 20);
  const allAuditsQuery = useAuditList(
    page,
    20,
    initializedFromQuery && !hasActiveSearch,
    globalOperationFilter === "ALL"
      ? undefined
      : {
          operation: globalOperationFilter,
        }
  );
  const detailQuery = useAuditEntry(detailDialogOpen ? selectedAuditId : null);
  const restoreMutation = useRestoreAuditEntry();

  const entityType = useMemo(() => inferEntityType(activeTableName), [activeTableName]);

  const userDetailQuery = useAdminUserDetail(entityType === "user" ? activeRowId : "");
  const tagDetailQuery = useAdminTagDetail(entityType === "tag" ? activeRowId : "");
  const resourceDetailQuery = useAdminResourceDetail(entityType === "resource" ? activeRowId : "");
  const subscriptionDetailQuery = useAdminSubscriptionDetail(entityType === "subscription" ? activeRowId : "");
  const paymentDetailQuery = useAdminPaymentDetail(entityType === "payment" ? activeRowId : "");

  const relatedEntityLoading =
    (entityType === "user" && userDetailQuery.isLoading) ||
    (entityType === "tag" && tagDetailQuery.isLoading) ||
    (entityType === "resource" && resourceDetailQuery.isLoading) ||
    (entityType === "subscription" && subscriptionDetailQuery.isLoading) ||
    (entityType === "payment" && paymentDetailQuery.isLoading);

  const relatedEntityError =
    (entityType === "user" && userDetailQuery.error) ||
    (entityType === "tag" && tagDetailQuery.error) ||
    (entityType === "resource" && resourceDetailQuery.error) ||
    (entityType === "subscription" && subscriptionDetailQuery.error) ||
    (entityType === "payment" && paymentDetailQuery.error) ||
    null;

  const relatedEntityRows = useMemo(() => {
    if (entityType === "user" && userDetailQuery.data) {
      return {
        title: "Utilisateur lié",
        rows: [
          { label: "Email", value: userDetailQuery.data.email },
          { label: "Rôle", value: userDetailQuery.data.role },
          { label: "Statut", value: userDetailQuery.data.is_active ? "Actif" : "Inactif" },
          { label: "Username", value: userDetailQuery.data.username ?? "-" },
        ],
      };
    }

    if (entityType === "tag" && tagDetailQuery.data) {
      return {
        title: "Tag lié",
        rows: [
          { label: "Nom", value: tagDetailQuery.data.name },
          { label: "Slug", value: tagDetailQuery.data.slug },
          { label: "Créé le", value: formatDate(tagDetailQuery.data.created_at) },
        ],
      };
    }

    if (entityType === "resource" && resourceDetailQuery.data) {
      return {
        title: "Ressource liée",
        rows: [
          { label: "Titre", value: resourceDetailQuery.data.title },
          { label: "Auteur", value: resourceDetailQuery.data.author_email },
          { label: "Visibilité", value: resourceDetailQuery.data.visibility },
          {
            label: "Prix",
            value:
              resourceDetailQuery.data.price_cents !== null
                ? `${(resourceDetailQuery.data.price_cents / 100).toFixed(2)} €`
                : "Gratuit",
          },
          {
            label: "Tags",
            value:
              resourceDetailQuery.data.tags.length > 0
                ? resourceDetailQuery.data.tags.map((tag) => tag.name).join(", ")
                : "-",
          },
        ],
      };
    }

    if (entityType === "subscription" && subscriptionDetailQuery.data) {
      return {
        title: "Abonnement lié",
        rows: [
          { label: "Utilisateur", value: subscriptionDetailQuery.data.user_email },
          { label: "Plan", value: subscriptionDetailQuery.data.plan },
          { label: "Statut", value: subscriptionDetailQuery.data.status },
          { label: "Début", value: formatDate(subscriptionDetailQuery.data.started_at) },
          { label: "Fin", value: subscriptionDetailQuery.data.ends_at ? formatDate(subscriptionDetailQuery.data.ends_at) : "-" },
        ],
      };
    }

    if (entityType === "payment" && paymentDetailQuery.data) {
      return {
        title: "Paiement lié",
        rows: [
          { label: "Utilisateur", value: paymentDetailQuery.data.user_email },
          {
            label: "Montant",
            value: `${(paymentDetailQuery.data.amount_cents / 100).toFixed(2)} ${paymentDetailQuery.data.currency.toUpperCase()}`,
          },
          { label: "Statut", value: paymentDetailQuery.data.status },
          { label: "Référence", value: paymentDetailQuery.data.provider_reference },
        ],
      };
    }

    return null;
  }, [
    entityType,
    paymentDetailQuery.data,
    resourceDetailQuery.data,
    subscriptionDetailQuery.data,
    tagDetailQuery.data,
    userDetailQuery.data,
  ]);

  const oldestVisibleEntry = useMemo(
    () => extractOldestVisibleEntry(historyQuery.data?.results ?? []),
    [historyQuery.data]
  );
  const oldestRestorableEntry = useMemo(
    () => extractOldestRestorableEntry(historyQuery.data?.results ?? []),
    [historyQuery.data]
  );

  const effectiveHistoryQuery = hasActiveSearch ? historyQuery : allAuditsQuery;
  const historyEntries = useMemo(
    () => effectiveHistoryQuery.data?.results ?? [],
    [effectiveHistoryQuery.data]
  );
  const userIdsToResolve = useMemo(() => {
    const userIds = new Set<string>();

    const addUserId = (userId: string | null | undefined) => {
      const normalizedId = (userId ?? "").trim();
      if (normalizedId) {
        userIds.add(normalizedId);
      }
    };

    const collectUserIdsFromData = (value: unknown, parentKey: string = "") => {
      if (typeof value === "string") {
        if (!isUuid(value)) return;
        const normalizedKey = parentKey.toLowerCase();
        if (
          normalizedKey.includes("user") ||
          normalizedKey.includes("author") ||
          normalizedKey.includes("changed_by")
        ) {
          addUserId(value);
        }
        return;
      }

      if (Array.isArray(value)) {
        value.forEach((item) => collectUserIdsFromData(item, parentKey));
        return;
      }

      if (value && typeof value === "object") {
        Object.entries(value as Record<string, unknown>).forEach(([key, nestedValue]) => {
          collectUserIdsFromData(nestedValue, key);
        });
      }
    };

    historyEntries.forEach((entry) => {
      addUserId(entry.actor_id);
      if (inferEntityType(entry.table_name) === "user") {
        addUserId(entry.row_id);
      }
      collectUserIdsFromData(entry.before_state);
      collectUserIdsFromData(entry.after_state);
      collectUserIdsFromData(entry.diff);
    });

    if (detailQuery.data) {
      addUserId(detailQuery.data.actor_id);
      if (inferEntityType(detailQuery.data.table_name) === "user") {
        addUserId(detailQuery.data.row_id);
      }
      collectUserIdsFromData(detailQuery.data.before_state);
      collectUserIdsFromData(detailQuery.data.after_state);
      collectUserIdsFromData(detailQuery.data.diff);
    }

    return Array.from(userIds);
  }, [detailQuery.data, historyEntries]);
  const { usersById } = useAuditUsersByIds(userIdsToResolve);

  const humanizeDataValue = (value: unknown, parentKey: string = ""): unknown => {
    if (typeof value === "string") {
      if (!isUuid(value)) return value;
      const normalizedKey = parentKey.toLowerCase();
      if (
        normalizedKey.includes("user") ||
        normalizedKey.includes("author") ||
        normalizedKey.includes("changed_by")
      ) {
        const resolvedUser = usersById[value];
        if (resolvedUser) {
          return formatResolvedUserLabel(resolvedUser, value);
        }
      }
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item) => humanizeDataValue(item, parentKey));
    }

    if (value && typeof value === "object") {
      const result: Record<string, unknown> = {};
      Object.entries(value as Record<string, unknown>).forEach(([key, nestedValue]) => {
        result[key] = humanizeDataValue(nestedValue, key);
      });
      return result;
    }

    return value;
  };

  const getDiffSummary = (entry: AuditHistoryItem, maxItems: number = 3): string => {
    const diffEntries = Object.entries(entry.diff ?? {});
    if (diffEntries.length === 0) return "";

    const summary = diffEntries.slice(0, maxItems).map(([fieldName, diffValue]) => {
      const fromValue = formatDiffValue(humanizeDataValue(diffValue.from, fieldName));
      const toValue = formatDiffValue(humanizeDataValue(diffValue.to, fieldName));
      return `${fieldName}: ${fromValue} -> ${toValue}`;
    });

    if (diffEntries.length > maxItems) {
      summary.push(`+${diffEntries.length - maxItems} autre(s)`);
    }

    return summary.join(" • ");
  };

  const getReasonLabel = (entry: AuditHistoryItem): string => {
    return entry.reason ?? "Aucune raison";
  };

  const resolveActorLabel = (entry: AuditHistoryItem): string => {
    const actorId = entry.actor_id?.trim();
    if (actorId) {
      if (actorId.toLowerCase() === "system") {
        return "Système";
      }
      const resolvedActor = usersById[actorId];
      if (resolvedActor) {
        return formatResolvedUserLabel(resolvedActor, actorId);
      }
      if (entry.actor_email) {
        return `${entry.actor_email} [${actorId}]`;
      }
      return `Utilisateur [${actorId}]`;
    }

    if (entry.actor_email) {
      return entry.actor_email;
    }

    return "Système";
  };

  const resolveObjectLabel = (entry: AuditHistoryItem): string => {
    const objectId = (entry.row_id || activeRowId || "-").trim();
    if (!objectId || objectId === "-") return "-";

    if (inferEntityType(entry.table_name || activeTableName) === "user") {
      const resolvedUser = usersById[objectId];
      if (resolvedUser) {
        return formatResolvedUserLabel(resolvedUser, objectId);
      }
    }

    return objectId;
  };

  const handleSearch = () => {
    if (!canSearch) return;
    setPage(1);
    setActiveTableName(tableName.trim());
    setActiveRowId(rowId.trim());
  };

  const openDetailDialog = (auditId: number | string) => {
    setSelectedAuditId(auditId);
    setDetailDialogOpen(true);
  };

  const openRestoreDialog = (entry: AuditHistoryItem, label: string) => {
    if (!isSupportedRestoreAction(entry.action)) {
      toast({
        title: "Restauration non autorisée",
        description: "La restauration est autorisée uniquement pour UPDATE et DELETE.",
        variant: "destructive",
      });
      return;
    }

    const numericAuditId = toNumericAuditId(entry.audit_id);

    if (numericAuditId === null) {
      toast({
        title: "Restauration impossible",
        description: "Audit ID invalide ou non numérique.",
        variant: "destructive",
      });
      return;
    }

    setRestoreReason("");
    setRestoreTarget({
      auditId: numericAuditId,
      label,
    });
    setRestoreDialogOpen(true);
  };

  const handleRestore = async () => {
    if (!restoreTarget) return;

    try {
      const response = await restoreMutation.mutateAsync({
        audit_id: restoreTarget.auditId,
        reason: restoreReason.trim() || undefined,
      });

      toast({
        title: "Restauration effectuée",
        description: response.message || "L'état sélectionné a été restauré avec succès.",
      });
      setRestoreDialogOpen(false);
      setRestoreTarget(null);
    } catch (error) {
      const apiError = error as { message?: string };
      toast({
        title: "Erreur de restauration",
        description: apiError.message || "Impossible de restaurer cette version.",
        variant: "destructive",
      });
    }
  };

  const hasHistoryItems = historyEntries.length > 0;
  const totalPages =
    effectiveHistoryQuery.data && effectiveHistoryQuery.data.count > 0
      ? Math.ceil(effectiveHistoryQuery.data.count / 20)
      : 1;
  const hasNextPage = Boolean(effectiveHistoryQuery.data?.next) || page < totalPages;
  const hasPreviousPage = page > 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit historique</h1>
        <p className="text-muted-foreground">
          Consultez l&apos;historique des changements et restaurez une version antérieure.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recherche d&apos;historique</CardTitle>
          <CardDescription>
            Saisissez un `table_name` et un `row_id` pour récupérer les entrées d&apos;audit.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="table_name" className="text-sm font-medium">
                Table name
              </label>
              <Input
                id="table_name"
                list="audit-table-suggestions"
                placeholder="Ex: resources_resource"
                value={tableName}
                onChange={(event) => setTableName(event.target.value)}
              />
              <datalist id="audit-table-suggestions">
                {TABLE_SUGGESTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </datalist>
            </div>
            <div className="space-y-2">
              <label htmlFor="row_id" className="text-sm font-medium">
                Row ID
              </label>
              <Input
                id="row_id"
                placeholder="Ex: UUID de la ligne"
                value={rowId}
                onChange={(event) => setRowId(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && canSearch) {
                    handleSearch();
                  }
                }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={handleSearch} disabled={!canSearch || historyQuery.isFetching} className="gap-2">
              {historyQuery.isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Rechercher
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setTableName("");
                setRowId("");
                setActiveTableName("");
                setActiveRowId("");
                setPage(1);
              }}
            >
              Réinitialiser
            </Button>
            {oldestVisibleEntry && (
              <Button
                variant="secondary"
                onClick={() =>
                  openRestoreDialog(
                    oldestRestorableEntry ?? oldestVisibleEntry,
                    `Restaurer la plus ancienne version restaurable (audit #${
                      (oldestRestorableEntry ?? oldestVisibleEntry).audit_id
                    })`
                  )
                }
                className="gap-2"
                disabled={!oldestRestorableEntry}
              >
                <RotateCcw className="h-4 w-4" />
                Restaurer la plus ancienne version restaurable
              </Button>
            )}
          </div>

          {!hasActiveSearch && (
            <div className="flex flex-wrap items-center gap-2 border-t pt-3">
              <span className="text-xs text-muted-foreground">Filtre opération (liste globale)</span>
              <Button
                size="sm"
                variant={globalOperationFilter === "ALL" ? "default" : "outline"}
                onClick={() => {
                  setGlobalOperationFilter("ALL");
                  setPage(1);
                }}
              >
                Toutes
              </Button>
              <Button
                size="sm"
                variant={globalOperationFilter === "INSERT" ? "default" : "outline"}
                onClick={() => {
                  setGlobalOperationFilter("INSERT");
                  setPage(1);
                }}
              >
                INSERT
              </Button>
              <Button
                size="sm"
                variant={globalOperationFilter === "UPDATE" ? "default" : "outline"}
                onClick={() => {
                  setGlobalOperationFilter("UPDATE");
                  setPage(1);
                }}
              >
                UPDATE
              </Button>
              <Button
                size="sm"
                variant={globalOperationFilter === "DELETE" ? "default" : "outline"}
                onClick={() => {
                  setGlobalOperationFilter("DELETE");
                  setPage(1);
                }}
              >
                DELETE
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {hasActiveSearch && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informations liées à l&apos;ID</CardTitle>
            <CardDescription>
              Données récupérées via les endpoints admin documentés pour améliorer le contexte d&apos;affichage.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {relatedEntityLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
              </div>
            ) : relatedEntityError ? (
              <p className="text-sm text-destructive">
                Impossible de charger les informations liées: {relatedEntityError.message}
              </p>
            ) : relatedEntityRows ? (
              <div className="space-y-3">
                <h3 className="font-medium">{relatedEntityRows.title}</h3>
                <div className="grid gap-2 md:grid-cols-2">
                  {relatedEntityRows.rows.map((row) => (
                    <div key={row.label} className="rounded-md border p-3">
                      <p className="text-xs text-muted-foreground">{row.label}</p>
                      <p className="text-sm font-medium break-all">{row.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucune prévisualisation disponible pour cette table.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Historique</CardTitle>
          <CardDescription>
            {hasActiveSearch
              ? `${historyQuery.data?.count ?? 0} entrée(s) d'audit trouvée(s).`
              : `${allAuditsQuery.data?.count ?? 0} audit(s) disponible(s). (INSERT/UPDATE/DELETE)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {effectiveHistoryQuery.isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-28 w-full" />
              ))}
            </div>
          ) : effectiveHistoryQuery.error ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
              Erreur lors du chargement de l&apos;historique: {effectiveHistoryQuery.error.message}
            </div>
          ) : hasHistoryItems ? (
            <div className="space-y-4">
              {historyEntries.map((entry) => (
                <div key={`${entry.audit_id}-${entry.timestamp}`} className="rounded-lg border p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={getActionBadgeVariant(entry.action)}>{formatActionLabel(entry.action)}</Badge>
                        <Badge variant="outline">{humanizeTableName(entry.table_name)}</Badge>
                        <span className="text-sm text-muted-foreground">{formatDate(entry.timestamp)}</span>
                      </div>
                      <p className="text-sm font-medium">
                        {getDiffSummary(entry) ||
                          entry.description ||
                          `${humanizeTableName(entry.table_name || activeTableName || "Entité")} • ${
                            entry.row_id || activeRowId || "-"
                          }`}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>Audit ID: {entry.audit_id}</span>
                        <span>Objet: {resolveObjectLabel(entry)}</span>
                        <span>Acteur: {resolveActorLabel(entry)}</span>
                        <span>Raison: {getReasonLabel(entry)}</span>
                        {entry.request_id && <span>Request ID: {entry.request_id}</span>}
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <Button variant="outline" size="sm" onClick={() => openDetailDialog(entry.audit_id)}>
                        <Eye className="h-4 w-4" />
                        Détail
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openRestoreDialog(entry, `Restaurer l'entrée #${entry.audit_id}`)}
                        disabled={!isSupportedRestoreAction(entry.action)}
                      >
                        <RotateCcw className="h-4 w-4" />
                        Restaurer
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {(hasPreviousPage || hasNextPage) && (
                <div className="flex items-center justify-between border-t pt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page}
                    {totalPages > 1 ? ` sur ${totalPages}` : ""}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={!hasPreviousPage}>
                      Précédent
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPage((value) => value + 1)} disabled={!hasNextPage}>
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <History className="mx-auto mb-2 h-10 w-10 opacity-40" />
              <p>
                {hasActiveSearch
                  ? "Aucune entrée d&apos;audit trouvée pour cet identifiant."
                  : "Aucun audit disponible."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Détail entrée d&apos;audit</DialogTitle>
            <DialogDescription>
              Audit #{selectedAuditId ?? "-"}
            </DialogDescription>
          </DialogHeader>

          {detailQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-36 w-full" />
              <Skeleton className="h-36 w-full" />
            </div>
          ) : detailQuery.error ? (
            <p className="text-sm text-destructive">Erreur: {detailQuery.error.message}</p>
          ) : detailQuery.data ? (
            <div className="space-y-4">
              <div className="grid gap-2 md:grid-cols-2">
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Action</p>
                  <p className="font-medium">{formatActionLabel(detailQuery.data.action)}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Table</p>
                  <p className="font-medium">{humanizeTableName(detailQuery.data.table_name)}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-medium">{formatDate(detailQuery.data.timestamp)}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Acteur</p>
                  <p className="font-medium break-all">{resolveActorLabel(detailQuery.data)}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Object ID</p>
                  <p className="font-medium break-all">{resolveObjectLabel(detailQuery.data)}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Raison</p>
                  <p className="font-medium break-all">{getReasonLabel(detailQuery.data)}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Request ID</p>
                  <p className="font-medium break-all">{detailQuery.data.request_id ?? "-"}</p>
                </div>
              </div>

              {Object.keys(detailQuery.data.diff).length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Changements détectés</p>
                  <div className="space-y-2 rounded-md border p-3">
                    {Object.entries(detailQuery.data.diff).map(([fieldName, diffValue]) => (
                      <div key={fieldName} className="text-xs">
                        <span className="font-semibold">{fieldName}: </span>
                        <span className="text-muted-foreground">
                          {formatDiffValue(humanizeDataValue(diffValue.from, fieldName))}
                        </span>
                        <span>{" -> "}</span>
                        <span className="font-medium">
                          {formatDiffValue(humanizeDataValue(diffValue.to, fieldName))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium">État avant</p>
                <pre className="max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs">
                  {formatJson(humanizeDataValue(detailQuery.data.before_state))}
                </pre>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">État après</p>
                <pre className="max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs">
                  {formatJson(humanizeDataValue(detailQuery.data.after_state))}
                </pre>
              </div>

              {detailQuery.data.snapshot !== null && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Snapshot</p>
                  <pre className="max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs">
                    {formatJson(humanizeDataValue(detailQuery.data.snapshot))}
                  </pre>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  variant="secondary"
                  onClick={() => openRestoreDialog(detailQuery.data, `Restaurer l'entrée #${detailQuery.data.audit_id}`)}
                  disabled={!isSupportedRestoreAction(detailQuery.data.action)}
                >
                  <RotateCcw className="h-4 w-4" />
                  Restaurer cet état
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucune donnée disponible.</p>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la restauration</DialogTitle>
            <DialogDescription>{restoreTarget?.label ?? "Sélectionnez une version à restaurer."}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label htmlFor="restore-reason" className="text-sm font-medium">
              Raison (optionnel)
            </label>
            <Textarea
              id="restore-reason"
              placeholder="Ex: rollback après une mauvaise mise à jour"
              value={restoreReason}
              onChange={(event) => setRestoreReason(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRestoreDialogOpen(false);
                setRestoreTarget(null);
              }}
            >
              Annuler
            </Button>
            <Button onClick={handleRestore} disabled={!restoreTarget || restoreMutation.isPending}>
              {restoreMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Restauration...
                </>
              ) : (
                "Restaurer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
