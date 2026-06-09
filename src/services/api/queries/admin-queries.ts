/**
 * TanStack Query hooks for Admin Endpoints
 * 
 * Handles all admin operations (users, tags, resources, subscriptions, payments, dashboard)
 * 
 * ⚠️ All admin endpoints require elevated permissions (IsAdmin or IsSuperAdmin)
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client";
import { API_ENDPOINTS } from "../../../constants/api";
import type { ApiError, ApiResponse } from "../../../types";

// ============================================================================
// Query Keys
// ============================================================================

const adminKeysBase = {
  all: ["admin"] as const,
};

export const adminKeys = {
  all: adminKeysBase.all,
  users: {
    all: [...adminKeysBase.all, "users"] as const,
    list: (search?: string, page?: number, pageSize?: number) => [...adminKeysBase.all, "users", "list", search, page, pageSize] as const,
    detail: (id: string) => [...adminKeysBase.all, "users", "detail", id] as const,
    activity: (id: string, limit?: number) => [...adminKeysBase.all, "users", "activity", id, limit] as const,
  },
  tags: {
    all: [...adminKeysBase.all, "tags"] as const,
    list: (search?: string, page?: number, pageSize?: number) => [...adminKeysBase.all, "tags", "list", search, page, pageSize] as const,
    detail: (id: string) => [...adminKeysBase.all, "tags", "detail", id] as const,
  },
  resources: {
    all: [...adminKeysBase.all, "resources"] as const,
    list: (filters?: AdminResourceFilters, page?: number, pageSize?: number) => [...adminKeysBase.all, "resources", "list", filters, page, pageSize] as const,
    detail: (id: string) => [...adminKeysBase.all, "resources", "detail", id] as const,
  },
  subscriptions: {
    all: [...adminKeysBase.all, "subscriptions"] as const,
    list: (filters?: AdminSubscriptionFilters, page?: number, pageSize?: number) => [...adminKeysBase.all, "subscriptions", "list", filters, page, pageSize] as const,
    detail: (id: string) => [...adminKeysBase.all, "subscriptions", "detail", id] as const,
  },
  payments: {
    all: [...adminKeysBase.all, "payments"] as const,
    list: (filters?: AdminPaymentFilters, page?: number, pageSize?: number) => [...adminKeysBase.all, "payments", "list", filters, page, pageSize] as const,
    detail: (id: string) => [...adminKeysBase.all, "payments", "detail", id] as const,
  },
  dashboard: {
    all: [...adminKeysBase.all, "dashboard"] as const,
    overview: () => [...adminKeysBase.all, "dashboard", "overview"] as const,
    activity: (limit?: number) => [...adminKeysBase.all, "dashboard", "activity", limit] as const,
    systemHealth: () => [...adminKeysBase.all, "dashboard", "system-health"] as const,
  },
};

// ============================================================================
// Types
// ============================================================================

// User Management
export interface AdminUser {
  id: string;
  email: string;
  role: "SUPERADMIN" | "ADMIN" | "MODERATOR" | "CONTRIBUTOR" | "USER";
  is_active: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  is_activated?: boolean;
  onboarding_step?: string;
  created_at: string;
  updated_at?: string;
  // Profile fields (may be included if backend supports it, or fetched separately)
  username?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
}

export interface AdminUserListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminUser[];
}

// Type pour la réponse directe (tableau simple)
type AdminUserArrayResponse = AdminUser[];

export interface AdminUserActivity {
  id: string;
  timestamp: string;
  action: string;
  entity_name: string;
  object_id: string;
  description: string;
}

export interface AdminUserActivityResponse {
  user_id: string;
  activities: AdminUserActivity[];
  count: number;
}

export interface SetUserRolePayload {
  role: "SUPERADMIN" | "ADMIN" | "MODERATOR" | "CONTRIBUTOR" | "USER";
}

export interface SetUserRoleResponse {
  user_id: string;
  email: string;
  role: string;
  previous_role: string;
}

export interface ImpersonateUserResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    username: string;
    activated: boolean;
    onboarding_step: string;
    role: string;
  };
}

// Tag Management
export interface AdminTag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface AdminTagListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminTag[];
}

export interface CreateTagPayload {
  name: string;
}

export interface CreateTagResponse {
  tag_id: string;
  name: string;
  slug: string;
}

export interface MergeTagsPayload {
  source_tag_id: string;
  target_tag_id: string;
}

// Resource Management
export interface AdminResourceFilters {
  author_id?: string;
  visibility?: "public" | "premium" | "private";
  has_price?: boolean;
  search?: string;
  tag_ids?: string[];
  include_deleted?: boolean;
}

export interface AdminResource {
  id: string;
  title: string;
  description: string;
  author_id: string;
  author_email: string;
  visibility: "public" | "premium" | "private";
  price_cents: number | null;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  versions: Array<{
    id: string;
    version_number: number;
    file_url: string;
    created_at: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface AdminResourceListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminResource[];
}

export interface CreateResourcePayload {
  author_id: string;
  title: string;
  description: string;
  visibility: "public" | "premium" | "private";
  price_cents?: number | null;
  tag_ids?: string[];
}

export interface UpdateResourcePayload {
  title?: string;
  description?: string;
  visibility?: "public" | "premium" | "private";
  price_cents?: number | null;
  tag_ids?: string[];
}

export interface AddResourceVersionPayload {
  file_url: string;
}

// Subscription Management
export interface AdminSubscriptionFilters {
  user_id?: string;
  status?: string;
  plan?: string;
}

export interface AdminSubscription {
  id: string;
  user: string;
  user_email: string;
  plan: string;
  status: string;
  started_at: string;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminSubscriptionListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminSubscription[];
}

export interface UpdateSubscriptionPayload {
  plan?: string;
  status?: string;
  ends_at?: string | null;
}

// Payment Management
export interface AdminPaymentFilters {
  user_id?: string;
  status?: "completed" | "pending" | "failed" | "refunded";
}

export interface AdminPayment {
  id: string;
  user_id: string;
  user_email: string;
  amount_cents: number;
  currency: string;
  status: string;
  provider_reference: string;
  created_at: string;
}

export interface AdminPaymentListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminPayment[];
}

export interface RefundPaymentPayload {
  amount_cents?: number;
}

// Dashboard
export interface DashboardOverview {
  total_users: number;
  active_users: number;
  total_resources: number;
  public_resources: number;
  premium_resources: number;
  total_subscriptions: number;
  active_premium_subscriptions: number;
  total_revenue_usd: number;
}

export interface DashboardActivity {
  id: string;
  timestamp: string;
  actor_email: string;
  action: string;
  entity_name: string;
  object_id: string;
  description: string;
}

export interface DashboardActivityResponse {
  activities: DashboardActivity[];
  count: number;
}

export interface SystemHealth {
  db_status: string;
  outbox_pending_events: number;
  outbox_failed_events: number;
  last_outbox_processed_at: string;
}

// ============================================================================
// User Management Hooks
// ============================================================================

export function useAdminUsers(search?: string, page: number = 1, pageSize: number = 20) {
  return useQuery<AdminUserListResponse, ApiError>({
    queryKey: adminKeys.users.list(search, page, pageSize),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      if (search && search.trim()) {
        params.append("search", search.trim());
      }
      const endpoint = `${API_ENDPOINTS.ADMIN.USERS.LIST}?${params}`;
      console.log("[useAdminUsers] Fetching:", endpoint);
      
      const response = await apiClient.get<AdminUserListResponse | AdminUserArrayResponse>(endpoint);
      
      console.log("[useAdminUsers] Raw response:", response);
      console.log("[useAdminUsers] Response data:", response.data);
      console.log("[useAdminUsers] Response data type:", typeof response.data);
      console.log("[useAdminUsers] Is array:", Array.isArray(response.data));
      
      const data = response.data;
      
      // Vérification de sécurité: s'assurer que data existe
      if (!data) {
        console.warn("[useAdminUsers] No data in response");
        return {
          count: 0,
          next: null,
          previous: null,
          results: [],
        };
      }
      
      // Si les données arrivent directement comme un tableau
      if (Array.isArray(data)) {
        console.log("[useAdminUsers] Data is array, length:", data.length);
        return {
          count: data.length,
          next: null,
          previous: null,
          results: data as AdminUser[],
        };
      }
      
      // Si les données ont la structure paginée Django REST Framework
      if (typeof data === "object" && "results" in data) {
        if (!Array.isArray(data.results)) {
          console.warn("[useAdminUsers] results is not an array:", data.results);
          return {
            count: 0,
            next: null,
            previous: null,
            results: [],
          };
        }
        return data as AdminUserListResponse;
      }
      
      // Si la structure est différente
      console.warn("[useAdminUsers] Unexpected data structure:", data);
      return {
        count: 0,
        next: null,
        previous: null,
        results: [],
      };
    },
  });
}

export function useAdminUserDetail(userId: string) {
  return useQuery<AdminUser, ApiError>({
    queryKey: adminKeys.users.detail(userId),
    queryFn: async () => {
      const response = await apiClient.get<AdminUser>(
        API_ENDPOINTS.ADMIN.USERS.DETAIL(userId)
      );
      return response.data;
    },
    enabled: !!userId,
  });
}

/**
 * Get admin user with profile information
 * 
 * Note: The AdminUser interface now includes optional profile fields (username, bio, avatar_url).
 * If the backend includes these fields in /admin/users/ or /admin/users/{id}/ responses, they will be available.
 * 
 * To fetch profile separately, use the useAuthorProfile hook from authors-queries:
 * ```tsx
 * const user = useAdminUserDetail(userId);
 * const profile = useAuthorProfile(userId);
 * ```
 */

export function useAdminUserActivity(userId: string, limit: number = 50) {
  return useQuery<AdminUserActivityResponse, ApiError>({
    queryKey: adminKeys.users.activity(userId, limit),
    queryFn: async () => {
      const params = new URLSearchParams({ limit: limit.toString() });
      const response = await apiClient.get<ApiResponse<AdminUserActivityResponse>>(
        `${API_ENDPOINTS.ADMIN.USERS.ACTIVITY(userId)}?${params}`
      );
      return response.data.data;
    },
    enabled: !!userId,
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();

  return useMutation<AdminUser, ApiError, { id: string; data: Partial<AdminUser> }>({
    mutationFn: async ({ id, data }) => {
      const response = await apiClient.patch<AdminUser>(
        API_ENDPOINTS.ADMIN.USERS.UPDATE(id),
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: adminKeys.users.all });
    },
  });
}

export function useDeleteAdminUser() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: async (userId: string) => {
      await apiClient.delete(API_ENDPOINTS.ADMIN.USERS.DELETE(userId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users.all });
    },
  });
}

export function useSetUserRole() {
  const queryClient = useQueryClient();

  return useMutation<SetUserRoleResponse, ApiError, { id: string; payload: SetUserRolePayload }>({
    mutationFn: async ({ id, payload }) => {
      const response = await apiClient.post<ApiResponse<SetUserRoleResponse>>(
        API_ENDPOINTS.ADMIN.USERS.SET_ROLE(id),
        payload
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users.detail(data.user_id) });
      queryClient.invalidateQueries({ queryKey: adminKeys.users.all });
    },
  });
}

export function useImpersonateUser() {
  return useMutation<ImpersonateUserResponse, ApiError, string>({
    mutationFn: async (userId: string) => {
      const response = await apiClient.post<ApiResponse<ImpersonateUserResponse>>(
        API_ENDPOINTS.ADMIN.USERS.IMPERSONATE(userId)
      );
      return response.data.data;
    },
  });
}

export function useResetUserPassword() {
  return useMutation<{ message: string }, ApiError, string>({
    mutationFn: async (userId: string) => {
      const response = await apiClient.post<ApiResponse<{ message: string }>>(
        API_ENDPOINTS.ADMIN.USERS.RESET_PASSWORD(userId)
      );
      return response.data.data;
    },
  });
}

// ============================================================================
// Tag Management Hooks
// ============================================================================

export function useAdminTags(search?: string, page: number = 1, pageSize: number = 20) {
  return useQuery<AdminTagListResponse, ApiError>({
    queryKey: adminKeys.tags.list(search, page, pageSize),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      if (search && search.trim()) {
        params.append("search", search.trim());
      }
      const endpoint = `${API_ENDPOINTS.ADMIN.TAGS.LIST}?${params}`;
      console.log("[useAdminTags] Fetching:", endpoint);
      
      // La réponse peut être { status: "ok", data: [...], count: number }
      const response = await apiClient.get<ApiResponse<AdminTag[]> & { count?: number }>(endpoint);
      
      console.log("[useAdminTags] Raw response:", response);
      console.log("[useAdminTags] Response data:", response.data);
      
      const data = response.data;
      
      // Si les données arrivent dans la structure { status: "ok", data: [...], count: number }
      if (data && typeof data === "object" && "data" in data) {
        const apiData = data as unknown as ApiResponse<AdminTag[]> & { count?: number };
        if (Array.isArray(apiData.data)) {
          console.log("[useAdminTags] Found ApiResponse structure, data length:", apiData.data.length, "count:", apiData.count);
          return {
            count: apiData.count ?? apiData.data.length,
            next: null,
            previous: null,
            results: apiData.data as AdminTag[],
          };
        }
      }
      
      // Si les données arrivent directement comme un tableau
      if (Array.isArray(data)) {
        console.log("[useAdminTags] Found direct array, length:", data.length);
        return {
          count: data.length,
          next: null,
          previous: null,
          results: data as AdminTag[],
        };
      }
      
      // Si les données arrivent dans la structure Django REST Framework
      if (data && typeof data === "object" && "results" in data) {
        const paginatedData = data as unknown as AdminTagListResponse;
        if (Array.isArray(paginatedData.results)) {
          console.log("[useAdminTags] Found paginated data, results length:", paginatedData.results.length);
          return paginatedData;
        }
      }
      
      console.warn("[useAdminTags] Unexpected data structure:", data);
      return {
        count: 0,
        next: null,
        previous: null,
        results: [],
      };
    },
  });
}

export function useAdminTagDetail(tagId: string) {
  return useQuery<AdminTag, ApiError>({
    queryKey: adminKeys.tags.detail(tagId),
    queryFn: async () => {
      const response = await apiClient.get<AdminTag>(
        API_ENDPOINTS.ADMIN.TAGS.DETAIL(tagId)
      );
      return response.data;
    },
    enabled: !!tagId,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation<CreateTagResponse, ApiError, CreateTagPayload>({
    mutationFn: async (payload) => {
      const response = await apiClient.post<ApiResponse<CreateTagResponse>>(
        API_ENDPOINTS.ADMIN.TAGS.CREATE,
        payload
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.tags.all });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation<CreateTagResponse, ApiError, { id: string; name: string }>({
    mutationFn: async ({ id, name }) => {
      const response = await apiClient.patch<ApiResponse<CreateTagResponse>>(
        API_ENDPOINTS.ADMIN.TAGS.UPDATE(id),
        { name }
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.tags.detail(data.tag_id) });
      queryClient.invalidateQueries({ queryKey: adminKeys.tags.all });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, ApiError, string>({
    mutationFn: async (tagId: string) => {
      const response = await apiClient.delete<ApiResponse<{ message: string }>>(
        API_ENDPOINTS.ADMIN.TAGS.DELETE(tagId)
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.tags.all });
    },
  });
}

export function useMergeTags() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string; source_tag_id: string; target_tag_id: string }, ApiError, MergeTagsPayload>({
    mutationFn: async (payload) => {
      const response = await apiClient.post<ApiResponse<{ message: string; source_tag_id: string; target_tag_id: string }>>(
        API_ENDPOINTS.ADMIN.TAGS.MERGE,
        payload
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.tags.all });
    },
  });
}

// ============================================================================
// Resource Management Hooks
// ============================================================================

export function useAdminResources(filters?: AdminResourceFilters, page: number = 1, pageSize: number = 20) {
  return useQuery<AdminResourceListResponse, ApiError>({
    queryKey: adminKeys.resources.list(filters, page, pageSize),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      if (filters?.author_id) params.append("author_id", filters.author_id);
      if (filters?.visibility) params.append("visibility", filters.visibility);
      if (filters?.has_price !== undefined) params.append("has_price", filters.has_price.toString());
      if (filters?.search) params.append("search", filters.search);
      if (filters?.tag_ids) {
        filters.tag_ids.forEach(id => params.append("tag_ids", id));
      }
      if (filters?.include_deleted) params.append("include_deleted", "true");
      
      const response = await apiClient.get<AdminResourceListResponse>(
        `${API_ENDPOINTS.ADMIN.RESOURCES.LIST}?${params}`
      );
      const data = response.data;
      // Vérification de sécurité
      if (!data || !Array.isArray(data.results)) {
        return {
          count: 0,
          next: null,
          previous: null,
          results: [],
        };
      }
      return data;
    },
  });
}

export function useAdminResourceDetail(resourceId: string) {
  return useQuery<AdminResource, ApiError>({
    queryKey: adminKeys.resources.detail(resourceId),
    queryFn: async () => {
      const response = await apiClient.get<AdminResource>(
        API_ENDPOINTS.ADMIN.RESOURCES.DETAIL(resourceId)
      );
      return response.data;
    },
    enabled: !!resourceId,
  });
}

export function useCreateAdminResource() {
  const queryClient = useQueryClient();

  return useMutation<{ resource_id: string; title: string; author_id: string }, ApiError, CreateResourcePayload>({
    mutationFn: async (payload) => {
      const response = await apiClient.post<ApiResponse<{ resource_id: string; title: string; author_id: string }>>(
        API_ENDPOINTS.ADMIN.RESOURCES.CREATE,
        payload
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.resources.all });
    },
  });
}

export function useUpdateAdminResource() {
  const queryClient = useQueryClient();

  return useMutation<{ resource_id: string; title: string; updated_fields: string[] }, ApiError, { id: string; data: UpdateResourcePayload }>({
    mutationFn: async ({ id, data }) => {
      const response = await apiClient.patch<ApiResponse<{ resource_id: string; title: string; updated_fields: string[] }>>(
        API_ENDPOINTS.ADMIN.RESOURCES.UPDATE(id),
        data
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.resources.detail(data.resource_id) });
      queryClient.invalidateQueries({ queryKey: adminKeys.resources.all });
    },
  });
}

export function useDeleteAdminResource() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, ApiError, string>({
    mutationFn: async (resourceId: string) => {
      const response = await apiClient.delete<ApiResponse<{ message: string }>>(
        API_ENDPOINTS.ADMIN.RESOURCES.DELETE(resourceId)
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.resources.all });
    },
  });
}

export function useAddAdminResourceVersion() {
  const queryClient = useQueryClient();

  return useMutation<{ resource_id: string; version_number: number; file_url: string }, ApiError, { id: string; payload: AddResourceVersionPayload }>({
    mutationFn: async ({ id, payload }) => {
      const response = await apiClient.post<ApiResponse<{ resource_id: string; version_number: number; file_url: string }>>(
        API_ENDPOINTS.ADMIN.RESOURCES.ADD_VERSION(id),
        payload
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.resources.detail(data.resource_id) });
    },
  });
}

// ============================================================================
// Subscription Management Hooks
// ============================================================================

export function useAdminSubscriptions(filters?: AdminSubscriptionFilters, page: number = 1, pageSize: number = 20) {
  return useQuery<AdminSubscriptionListResponse, ApiError>({
    queryKey: adminKeys.subscriptions.list(filters, page, pageSize),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      if (filters?.user_id) params.append("user_id", filters.user_id);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.plan) params.append("plan", filters.plan);
      
      const response = await apiClient.get<AdminSubscriptionListResponse>(
        `${API_ENDPOINTS.ADMIN.SUBSCRIPTIONS.LIST}?${params}`
      );
      const data = response.data;
      // Vérification de sécurité
      if (!data || !Array.isArray(data.results)) {
        return {
          count: 0,
          next: null,
          previous: null,
          results: [],
        };
      }
      return data;
    },
  });
}

export function useAdminSubscriptionDetail(subscriptionId: string) {
  return useQuery<AdminSubscription, ApiError>({
    queryKey: adminKeys.subscriptions.detail(subscriptionId),
    queryFn: async () => {
      const response = await apiClient.get<AdminSubscription>(
        API_ENDPOINTS.ADMIN.SUBSCRIPTIONS.DETAIL(subscriptionId)
      );
      return response.data;
    },
    enabled: !!subscriptionId,
  });
}

export function useUpdateAdminSubscription() {
  const queryClient = useQueryClient();

  return useMutation<{ subscription_id: string; status: string; plan: string }, ApiError, { id: string; data: UpdateSubscriptionPayload }>({
    mutationFn: async ({ id, data }) => {
      const response = await apiClient.patch<ApiResponse<{ subscription_id: string; status: string; plan: string }>>(
        API_ENDPOINTS.ADMIN.SUBSCRIPTIONS.UPDATE(id),
        data
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.subscriptions.detail(data.subscription_id) });
      queryClient.invalidateQueries({ queryKey: adminKeys.subscriptions.all });
    },
  });
}

export function useCancelAdminSubscription() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, ApiError, string>({
    mutationFn: async (subscriptionId: string) => {
      const response = await apiClient.post<ApiResponse<{ message: string }>>(
        API_ENDPOINTS.ADMIN.SUBSCRIPTIONS.CANCEL(subscriptionId)
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.subscriptions.all });
    },
  });
}

// ============================================================================
// Payment Management Hooks
// ============================================================================

export function useAdminPayments(filters?: AdminPaymentFilters, page: number = 1, pageSize: number = 20) {
  return useQuery<AdminPaymentListResponse, ApiError>({
    queryKey: adminKeys.payments.list(filters, page, pageSize),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      if (filters?.user_id) params.append("user_id", filters.user_id);
      if (filters?.status) params.append("status", filters.status);
      
      const response = await apiClient.get<AdminPaymentListResponse>(
        `${API_ENDPOINTS.ADMIN.PAYMENTS.LIST}?${params}`
      );
      const data = response.data;
      // Vérification de sécurité
      if (!data || !Array.isArray(data.results)) {
        return {
          count: 0,
          next: null,
          previous: null,
          results: [],
        };
      }
      return data;
    },
  });
}

export function useAdminPaymentDetail(paymentId: string) {
  return useQuery<AdminPayment, ApiError>({
    queryKey: adminKeys.payments.detail(paymentId),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<AdminPayment>>(
        API_ENDPOINTS.ADMIN.PAYMENTS.DETAIL(paymentId)
      );
      return response.data.data;
    },
    enabled: !!paymentId,
  });
}

export function useRefundPayment() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string; refund_amount_cents: number }, ApiError, { id: string; payload?: RefundPaymentPayload }>({
    mutationFn: async ({ id, payload }) => {
      const response = await apiClient.post<ApiResponse<{ message: string; refund_amount_cents: number }>>(
        API_ENDPOINTS.ADMIN.PAYMENTS.REFUND(id),
        payload || {}
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.payments.all });
    },
  });
}

// ============================================================================
// Dashboard Hooks
// ============================================================================

export function useDashboardOverview() {
  return useQuery<DashboardOverview, ApiError>({
    queryKey: adminKeys.dashboard.overview(),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<DashboardOverview>>(
        API_ENDPOINTS.ADMIN.DASHBOARD.OVERVIEW
      );
      return response.data.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useDashboardActivity(limit: number = 50) {
  return useQuery<DashboardActivityResponse, ApiError>({
    queryKey: adminKeys.dashboard.activity(limit),
    queryFn: async () => {
      const params = new URLSearchParams({ limit: limit.toString() });
      const response = await apiClient.get<ApiResponse<DashboardActivityResponse>>(
        `${API_ENDPOINTS.ADMIN.DASHBOARD.ACTIVITY}?${params}`
      );
      return response.data.data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useSystemHealth() {
  return useQuery<SystemHealth, ApiError>({
    queryKey: adminKeys.dashboard.systemHealth(),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<SystemHealth>>(
        API_ENDPOINTS.ADMIN.DASHBOARD.SYSTEM_HEALTH
      );
      return response.data.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}
