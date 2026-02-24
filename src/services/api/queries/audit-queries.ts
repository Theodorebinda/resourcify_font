/**
 * TanStack Query hooks for Audit Endpoints
 *
 * Handles audit history lookup, single audit entry detail, and restore action.
 */

import { useMemo } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client";
import { API_ENDPOINTS } from "../../../constants/api";
import type { ApiError } from "../../../types";
import { adminKeys } from "./admin-queries";

const auditKeysBase = {
  all: ["audit"] as const,
};

export const auditKeys = {
  all: auditKeysBase.all,
  list: (page?: number, pageSize?: number, filters?: AuditListFilters) =>
    [...auditKeysBase.all, "list", page, pageSize, filters] as const,
  user: (userId: string) => [...auditKeysBase.all, "user", userId] as const,
  history: (tableName: string, rowId: string, page?: number, pageSize?: number) =>
    [...auditKeysBase.all, "history", tableName, rowId, page, pageSize] as const,
  entry: (auditId: AuditIdentifier | null | undefined) =>
    [...auditKeysBase.all, "entry", auditId] as const,
};

export type AuditIdentifier = string | number;
export type AuditAction = "UPDATE" | "DELETE" | string;

export interface AuditDiffEntry {
  from: unknown;
  to: unknown;
}

export type AuditDiffRecord = Record<string, AuditDiffEntry>;

export interface AuditHistoryItem {
  id: AuditIdentifier;
  audit_id: AuditIdentifier;
  timestamp: string;
  action: AuditAction;
  entity_name: string;
  table_name: string;
  row_id: string;
  actor_email: string | null;
  actor_id: string | null;
  reason: string | null;
  request_id: string | null;
  diff: AuditDiffRecord;
  description: string;
  before_state: unknown | null;
  after_state: unknown | null;
  snapshot: unknown | null;
  raw: Record<string, unknown>;
}

export interface AuditHistoryResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AuditHistoryItem[];
}

export type AuditEntryDetail = AuditHistoryItem;

export interface RestoreAuditPayload {
  audit_id: number;
  reason?: string;
}

export interface RestoreAuditResponse {
  message: string;
  restored_audit_id: AuditIdentifier | null;
  audit_id?: AuditIdentifier | null;
  restored_table?: string | null;
  restored_row_id?: string | null;
  operation?: string | null;
  restored?: boolean | null;
  effect?: string | null;
}

export interface AuditListFilters {
  table_name?: string;
  operation?: "UPDATE" | "DELETE";
  changed_by?: string;
  request_id?: string;
}

export interface AuditResolvedUser {
  id: string;
  email: string;
  username: string | null;
  role: string | null;
  is_active: boolean | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function asNullableString(value: unknown): string | null {
  const normalized = asString(value).trim();
  return normalized ? normalized : null;
}

function asCount(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function asNullableBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  return null;
}

function normalizeAuditAction(value: unknown): AuditAction {
  const normalized = asString(value).trim().toUpperCase();
  if (!normalized) return "UNKNOWN";
  if (normalized === "UPDATE") return "UPDATE";
  if (normalized === "DELETE") return "DELETE";
  return normalized;
}

export function isSupportedRestoreAction(action: string): boolean {
  const normalized = action.toUpperCase();
  return normalized === "UPDATE" || normalized === "DELETE";
}

function getDiffRecord(value: unknown): AuditDiffRecord {
  if (!isRecord(value)) return {};

  const result: AuditDiffRecord = {};
  Object.entries(value).forEach(([fieldName, fieldDiff]) => {
    if (isRecord(fieldDiff)) {
      result[fieldName] = {
        from: fieldDiff.from ?? null,
        to: fieldDiff.to ?? null,
      };
    }
  });

  return result;
}

function unwrapApiPayload(payload: unknown): unknown {
  if (isRecord(payload) && "data" in payload) {
    return payload.data;
  }
  return payload;
}

function getAuditIdentifier(record: Record<string, unknown>): AuditIdentifier | null {
  const candidate = record.audit_id ?? record.id ?? record.pk;
  if (typeof candidate === "string" || typeof candidate === "number") {
    return candidate;
  }
  return null;
}

function normalizeAuditItem(raw: unknown): AuditHistoryItem | null {
  if (!isRecord(raw)) return null;

  const auditIdentifier = getAuditIdentifier(raw);
  if (auditIdentifier === null) return null;

  const actorRecord = isRecord(raw.actor) ? raw.actor : null;
  const reason = asNullableString(raw.reason ?? raw.description ?? raw.message);
  const action = normalizeAuditAction(raw.operation ?? raw.action ?? raw.event_type ?? raw.type);
  const tableName = asString(raw.table_name ?? raw.content_type ?? raw.entity_name ?? raw.entity ?? "");
  const rowId = asString(raw.row_id ?? raw.object_id ?? raw.objectId ?? "");
  const actorId = asNullableString(
    raw.actor_id ?? raw.changed_by ?? (actorRecord ? actorRecord.id : undefined)
  );
  const actorEmail = asNullableString(
    raw.actor_email ?? raw.changed_by_email ?? (actorRecord ? actorRecord.email : undefined)
  );

  const description =
    asString(raw.description ?? raw.message ?? raw.detail).trim() ||
    `${action} sur ${tableName || "entité"}${rowId ? ` (${rowId})` : ""}${
      reason ? ` - ${reason}` : ""
    }`;

  return {
    id: auditIdentifier,
    audit_id: auditIdentifier,
    timestamp: asString(raw.changed_at ?? raw.timestamp ?? raw.created_at ?? raw.date ?? ""),
    action,
    entity_name: asString(raw.entity_name ?? raw.entity ?? tableName ?? ""),
    table_name: tableName,
    row_id: rowId,
    actor_email: actorEmail,
    actor_id: actorId,
    reason,
    request_id: asNullableString(raw.request_id),
    diff: getDiffRecord(raw.diff),
    description,
    before_state: raw.before_state ?? raw.old_data ?? raw.before ?? null,
    after_state: raw.after_state ?? raw.new_data ?? raw.after ?? null,
    snapshot: raw.snapshot ?? raw.new_data ?? raw.after_state ?? null,
    raw,
  };
}

function resolveAuditItems(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!isRecord(payload)) return [];

  const arrayKeys = ["results", "entries", "history", "activities", "items", "data"] as const;
  for (const key of arrayKeys) {
    const candidate = payload[key];
    if (Array.isArray(candidate)) return candidate;
  }

  for (const value of Object.values(payload)) {
    if (Array.isArray(value)) return value;
  }

  return [];
}

function normalizeAuditHistoryResponse(payload: unknown): AuditHistoryResponse {
  const unwrappedPayload = unwrapApiPayload(payload);
  const sourceRecord = isRecord(unwrappedPayload) ? unwrappedPayload : null;
  const pagination =
    sourceRecord && isRecord(sourceRecord.pagination)
      ? sourceRecord.pagination
      : null;
  const rawItems = resolveAuditItems(unwrappedPayload);
  const normalizedItems = rawItems
    .map((item) => normalizeAuditItem(item))
    .filter((item): item is AuditHistoryItem => item !== null);

  const currentPage = asCount(sourceRecord?.page ?? pagination?.page, 1);
  const pageSize = asCount(
    sourceRecord?.page_size ?? pagination?.page_size,
    normalizedItems.length || 20
  );
  const totalCount = asCount(
    sourceRecord?.count ??
      sourceRecord?.total ??
      sourceRecord?.total_count ??
      pagination?.total_count,
    normalizedItems.length
  );
  const hasNext =
    pagination && typeof pagination.has_next === "boolean"
      ? pagination.has_next
      : currentPage * pageSize < totalCount;
  const hasPrevious =
    pagination && typeof pagination.has_previous === "boolean"
      ? pagination.has_previous
      : currentPage > 1;

  return {
    count: totalCount,
    next: asNullableString(sourceRecord?.next) ?? (hasNext ? String(currentPage + 1) : null),
    previous:
      asNullableString(sourceRecord?.previous) ??
      (hasPrevious ? String(Math.max(1, currentPage - 1)) : null),
    results: normalizedItems,
  };
}

function normalizeAuditEntryResponse(payload: unknown): AuditEntryDetail {
  const unwrappedPayload = unwrapApiPayload(payload);
  const normalized = normalizeAuditItem(unwrappedPayload);

  if (normalized) {
    return normalized;
  }

  return {
    id: 0,
    audit_id: 0,
    timestamp: "",
    action: "UNKNOWN",
    entity_name: "",
    table_name: "",
    row_id: "",
    actor_email: null,
    actor_id: null,
    reason: null,
    request_id: null,
    diff: {},
    description: "",
    before_state: null,
    after_state: null,
    snapshot: null,
    raw: isRecord(unwrappedPayload) ? unwrappedPayload : {},
  };
}

function normalizeRestoreResponse(payload: unknown): RestoreAuditResponse {
  const unwrappedPayload = unwrapApiPayload(payload);

  if (!isRecord(unwrappedPayload)) {
    return {
      message: "Restauration effectuée",
      restored_audit_id: null,
    };
  }

  const restoredAuditId = getAuditIdentifier(unwrappedPayload) ?? unwrappedPayload.restored_audit_id;
  const restoredTable = asNullableString(
    unwrappedPayload.restored_table ?? unwrappedPayload.table_name
  );
  const restoredRowId = asNullableString(
    unwrappedPayload.restored_row_id ?? unwrappedPayload.row_id
  );
  const operation = asNullableString(unwrappedPayload.operation);
  const restored =
    typeof unwrappedPayload.restored === "boolean"
      ? unwrappedPayload.restored
      : null;
  const effect = asNullableString(unwrappedPayload.effect);

  return {
    message:
      asString(
        unwrappedPayload.message ??
          unwrappedPayload.detail ??
          effect ??
          "Restauration effectuée"
      ) || "Restauration effectuée",
    restored_audit_id:
      typeof restoredAuditId === "string" || typeof restoredAuditId === "number"
        ? restoredAuditId
        : null,
    audit_id:
      typeof unwrappedPayload.audit_id === "string" || typeof unwrappedPayload.audit_id === "number"
        ? (unwrappedPayload.audit_id as AuditIdentifier)
        : null,
    restored_table: restoredTable,
    restored_row_id: restoredRowId,
    operation,
    restored,
    effect,
  };
}

function normalizeAuditUserResponse(payload: unknown, fallbackUserId: string): AuditResolvedUser {
  const unwrappedPayload = unwrapApiPayload(payload);

  if (!isRecord(unwrappedPayload)) {
    return {
      id: fallbackUserId,
      email: "",
      username: null,
      role: null,
      is_active: null,
    };
  }

  return {
    id: asString(unwrappedPayload.id ?? fallbackUserId),
    email: asString(unwrappedPayload.email ?? unwrappedPayload.user_email),
    username: asNullableString(unwrappedPayload.username),
    role: asNullableString(unwrappedPayload.role),
    is_active: asNullableBoolean(unwrappedPayload.is_active),
  };
}

export function toNumericAuditId(auditId: AuditIdentifier | null | undefined): number | null {
  if (typeof auditId === "number" && Number.isFinite(auditId)) return auditId;
  if (typeof auditId === "string") {
    const parsed = Number.parseInt(auditId, 10);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function useAuditUsersByIds(userIds: string[]) {
  const uniqueUserIds = useMemo(() => {
    const distinctIds = new Set<string>();
    userIds.forEach((userId) => {
      const normalizedId = userId.trim();
      if (normalizedId) {
        distinctIds.add(normalizedId);
      }
    });
    return Array.from(distinctIds);
  }, [userIds]);

  const queryResults = useQueries({
    queries: uniqueUserIds.map((userId) => ({
      queryKey: auditKeys.user(userId),
      queryFn: async (): Promise<AuditResolvedUser> => {
        const response = await apiClient.get<unknown>(
          API_ENDPOINTS.ADMIN.USERS.DETAIL(encodeURIComponent(userId))
        );
        return normalizeAuditUserResponse(response.data, userId);
      },
      enabled: Boolean(userId),
      staleTime: 60 * 1000,
      retry: 0,
    })),
  });

  const usersById = useMemo(() => {
    const record: Record<string, AuditResolvedUser> = {};
    uniqueUserIds.forEach((userId, index) => {
      const userData = queryResults[index]?.data;
      if (userData) {
        record[userId] = userData;
      }
    });
    return record;
  }, [queryResults, uniqueUserIds]);

  return {
    usersById,
    isLoading: queryResults.some((query) => query.isLoading),
  };
}

export function useAuditList(
  page: number = 1,
  pageSize: number = 20,
  enabled: boolean = true,
  filters?: AuditListFilters
) {
  return useQuery<AuditHistoryResponse, ApiError>({
    queryKey: auditKeys.list(page, pageSize, filters),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      if (filters?.table_name?.trim()) {
        params.append("table_name", filters.table_name.trim());
      }
      if (filters?.operation) {
        params.append("operation", filters.operation);
      }
      if (filters?.changed_by?.trim()) {
        params.append("changed_by", filters.changed_by.trim());
      }
      if (filters?.request_id?.trim()) {
        params.append("request_id", filters.request_id.trim());
      }

      const response = await apiClient.get<unknown>(
        `${API_ENDPOINTS.AUDIT.LIST}?${params.toString()}`
      );
      return normalizeAuditHistoryResponse(response.data);
    },
    enabled,
    staleTime: 30 * 1000,
  });
}

export function useAuditHistory(
  tableName: string,
  rowId: string,
  page: number = 1,
  pageSize: number = 20
) {
  const sanitizedTableName = tableName.trim();
  const sanitizedRowId = rowId.trim();

  return useQuery<AuditHistoryResponse, ApiError>({
    queryKey: auditKeys.history(sanitizedTableName, sanitizedRowId, page, pageSize),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });

      const endpoint = API_ENDPOINTS.AUDIT.HISTORY(
        encodeURIComponent(sanitizedTableName),
        encodeURIComponent(sanitizedRowId)
      );

      const response = await apiClient.get<unknown>(`${endpoint}?${params.toString()}`);
      return normalizeAuditHistoryResponse(response.data);
    },
    enabled: Boolean(sanitizedTableName) && Boolean(sanitizedRowId),
    staleTime: 30 * 1000,
  });
}

export function useAuditEntry(auditId: AuditIdentifier | null) {
  return useQuery<AuditEntryDetail, ApiError>({
    queryKey: auditKeys.entry(auditId),
    queryFn: async () => {
      const endpoint = API_ENDPOINTS.AUDIT.ENTRY(encodeURIComponent(String(auditId)));
      const response = await apiClient.get<unknown>(endpoint);
      return normalizeAuditEntryResponse(response.data);
    },
    enabled: auditId !== null && auditId !== undefined && String(auditId).trim().length > 0,
  });
}

export function useRestoreAuditEntry() {
  const queryClient = useQueryClient();

  return useMutation<RestoreAuditResponse, ApiError, RestoreAuditPayload>({
    mutationFn: async (payload) => {
      const response = await apiClient.post<unknown>(API_ENDPOINTS.AUDIT.RESTORE, payload);
      return normalizeRestoreResponse(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: auditKeys.all });
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard.all });
    },
  });
}
