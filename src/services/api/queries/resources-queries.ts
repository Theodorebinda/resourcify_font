/**
 * TanStack Query hooks for Resources
 * 
 * Handles resource feed, detail, access, and version management
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client";
import { API_ENDPOINTS } from "../../../constants/api";
import type { ApiError, ApiResponse } from "../../../types";

// Query keys
export const resourceKeys = {
  all: ["resources"] as const,
  feed: (page?: number, pageSize?: number) => [...resourceKeys.all, "feed", page, pageSize] as const,
  detail: (id: string) => [...resourceKeys.all, "detail", id] as const,
};

// Types
export interface ResourceFeedItem {
  id: string;
  title: string;
  author_name: string;
  author_avatar: string | null;
  tags: string[];
  stats: {
    comment_count: number;
  };
  price_cents: number | null;
  visibility: "public" | "premium" | "private";
}

export interface ResourceDetail {
  id: string;
  title: string;
  description: string;
  author_name: string;
  author_avatar: string | null;
  tags: string[];
  visibility: "public" | "premium" | "private";
  price_cents: number | null;
  versions: Array<{
    version_number: number;
    file_url: string;
    created_at: string;
  }>;
}

export interface ResourceAccessResponse {
  access_granted: boolean;
  resource_id: string;
  latest_version: {
    version_number: number;
    file_url: string;
  };
}

export interface CreateResourceVersionPayload {
  resource_id: string;
  file_url: string;
}

export interface CreateResourceVersionResponse {
  version_number: number;
  file_url: string;
  created_at: string;
}

/**
 * Get resource feed (paginated)
 */
export function useResourceFeed(page: number = 1, pageSize: number = 20) {
  return useQuery<ResourceFeedItem[], ApiError>({
    queryKey: resourceKeys.feed(page, pageSize),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      const response = await apiClient.get<{ data: ResourceFeedItem[] }>(
        `${API_ENDPOINTS.RESOURCES.FEED}?${params}`
      );
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get resource detail
 */
export function useResourceDetail(resourceId: string) {
  return useQuery<ResourceDetail, ApiError>({
    queryKey: resourceKeys.detail(resourceId),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<ResourceDetail>>(
        API_ENDPOINTS.RESOURCES.DETAIL(resourceId)
      );
      return response.data.data;
    },
    enabled: !!resourceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Request access to a resource
 */
export function useAccessResource() {
  return useMutation<ResourceAccessResponse, ApiError, string>({
    mutationFn: async (resourceId: string) => {
      const response = await apiClient.post<ApiResponse<ResourceAccessResponse>>(
        API_ENDPOINTS.RESOURCES.ACCESS(resourceId)
      );
      return response.data.data;
    },
  });
}

/**
 * Create a new resource version
 */
export function useCreateResourceVersion() {
  const queryClient = useQueryClient();

  return useMutation<CreateResourceVersionResponse, ApiError, CreateResourceVersionPayload>({
    mutationFn: async (payload) => {
      const response = await apiClient.post<ApiResponse<CreateResourceVersionResponse>>(
        API_ENDPOINTS.RESOURCES.VERSIONS,
        payload
      );
      return response.data.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate resource detail to refetch with new version
      queryClient.invalidateQueries({ queryKey: resourceKeys.detail(variables.resource_id) });
    },
  });
}
