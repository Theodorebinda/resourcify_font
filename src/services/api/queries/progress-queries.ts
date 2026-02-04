/**
 * TanStack Query hooks for Progress
 * 
 * Handles user progress tracking on resources
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client";
import { API_ENDPOINTS } from "../../../constants/api";
import type { ApiError, ApiResponse } from "../../../types";

// Query keys
export const progressKeys = {
  all: ["progress"] as const,
  user: (page?: number, pageSize?: number) => [...progressKeys.all, "user", page, pageSize] as const,
  resource: (resourceId: string) => [...progressKeys.all, "resource", resourceId] as const,
  resourceUsers: (resourceId: string, page?: number, pageSize?: number) => 
    [...progressKeys.all, "resource-users", resourceId, page, pageSize] as const,
  admin: (filters?: AdminProgressFilters, page?: number, pageSize?: number) => 
    [...progressKeys.all, "admin", filters, page, pageSize] as const,
};

// Types
export type ProgressStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export interface ProgressItem {
  progress_id: string | null;
  user_id: string;
  resource_id: string;
  status: ProgressStatus;
  started_at: string | null;
  last_accessed_at: string | null;
  completed_at: string | null;
}

export interface UserProgressSummary {
  total_resources: number;
  completed_count: number;
  in_progress_count: number;
  not_started_count: number;
}

export interface UserProgressItem {
  progress_id: string;
  resource_id: string;
  resource_title: string;
  author_name: string;
  author_avatar: string | null;
  status: ProgressStatus;
  started_at: string | null;
  last_accessed_at: string | null;
  completed_at: string | null;
}

export interface UserProgressResponse {
  summary: UserProgressSummary;
  data: UserProgressItem[];
  pagination: {
    page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

export interface CompleteProgressResponse {
  progress_id: string;
  user_id: string;
  resource_id: string;
  status: "COMPLETED";
  started_at: string;
  last_accessed_at: string;
  completed_at: string;
}

export interface ResourceUsersProgressEntry {
  id: string;
  user_id: string;
  user_email: string;
  username: string;
  avatar_url: string | null;
  status: ProgressStatus;
  started_at: string | null;
  last_accessed_at: string | null;
  completed_at: string | null;
}

export interface ResourceUsersProgressResponse {
  resource_id: string;
  resource_title: string;
  progress_entries: ResourceUsersProgressEntry[];
  pagination: {
    page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

export interface AdminProgressEntry {
  id: string;
  user_id: string;
  user_email: string;
  username: string;
  avatar_url: string | null;
  resource_id: string;
  resource_title: string;
  author_id: string;
  author_email: string;
  status: ProgressStatus;
  started_at: string | null;
  last_accessed_at: string | null;
  completed_at: string | null;
}

export interface AdminProgressFilters {
  resource_id?: string;
  user_id?: string;
}

export interface AdminProgressResponse {
  progress_entries: AdminProgressEntry[];
  pagination: {
    page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
  filters: {
    resource_id: string | null;
    user_id: string | null;
  };
}

/**
 * Get user's progress list with summary statistics
 */
export function useUserProgress(page: number = 1, pageSize: number = 20) {
  return useQuery<UserProgressResponse, ApiError>({
    queryKey: progressKeys.user(page, pageSize),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      const response = await apiClient.get<ApiResponse<UserProgressResponse>>(
        `${API_ENDPOINTS.USER.PROGRESS}?${params}`
      );
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get current user's progress for a specific resource
 */
export function useResourceProgress(resourceId: string) {
  return useQuery<ProgressItem, ApiError>({
    queryKey: progressKeys.resource(resourceId),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<ProgressItem>>(
        API_ENDPOINTS.RESOURCES.PROGRESS(resourceId)
      );
      return response.data.data;
    },
    enabled: !!resourceId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Complete resource progress (mark as completed)
 * This action is idempotent
 */
export function useCompleteResourceProgress() {
  const queryClient = useQueryClient();

  return useMutation<CompleteProgressResponse, ApiError, string>({
    mutationFn: async (resourceId: string) => {
      const response = await apiClient.post<ApiResponse<CompleteProgressResponse>>(
        API_ENDPOINTS.RESOURCES.COMPLETE(resourceId)
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      // Invalidate progress queries to refresh UI
      queryClient.invalidateQueries({ queryKey: progressKeys.resource(data.resource_id) });
      queryClient.invalidateQueries({ queryKey: progressKeys.user() });
      queryClient.invalidateQueries({ queryKey: progressKeys.resourceUsers(data.resource_id) });
      // Also invalidate resource detail if it shows progress
      queryClient.invalidateQueries({ queryKey: ["resources", "detail", data.resource_id] });
    },
  });
}

/**
 * Get all users' progress on a specific resource
 * Only resource authors (CONTRIBUTOR, MODERATOR, ADMIN, SUPERADMIN) can view this
 * ADMIN and SUPERADMIN can view progress on any resource
 */
export function useResourceUsersProgress(
  resourceId: string,
  page: number = 1,
  pageSize: number = 20
) {
  return useQuery<ResourceUsersProgressResponse, ApiError>({
    queryKey: progressKeys.resourceUsers(resourceId, page, pageSize),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      const response = await apiClient.get<ApiResponse<ResourceUsersProgressResponse>>(
        `${API_ENDPOINTS.RESOURCES.USERS_PROGRESS(resourceId)}?${params}`
      );
      return response.data.data;
    },
    enabled: !!resourceId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get all progress entries across all resources (Admin only)
 * Only ADMIN and SUPERADMIN can access this endpoint
 * Supports optional filtering by resource_id and user_id
 */
export function useAdminProgress(
  filters?: AdminProgressFilters,
  page: number = 1,
  pageSize: number = 20
) {
  return useQuery<AdminProgressResponse, ApiError>({
    queryKey: progressKeys.admin(filters, page, pageSize),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      if (filters?.resource_id) {
        params.append("resource_id", filters.resource_id);
      }
      if (filters?.user_id) {
        params.append("user_id", filters.user_id);
      }
      const response = await apiClient.get<ApiResponse<AdminProgressResponse>>(
        `${API_ENDPOINTS.ADMIN.PROGRESS}?${params}`
      );
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
