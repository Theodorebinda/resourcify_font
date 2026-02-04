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
  // Vote stats (if available from backend)
  stats?: {
    upvotes: number;
    downvotes: number;
    total_votes: number;
  };
  // User's vote (if available from backend)
  user_vote?: 1 | -1 | null;
  // Comments may be included in the response (if backend supports it)
  comments?: Array<{
    id: string;
    author_name: string;
    author_avatar: string | null;
    content: string;
    created_at: string;
    vote_count: number;
    user_vote: 1 | -1 | null;
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

export interface CreateResourceFormPayload {
  title: string;
  description: string;
  visibility: "public" | "premium" | "private";
  price_cents?: number | null;
  tag_ids?: string[];
  file_url: string; // URL du fichier pour la première version
}

export interface CreateResourceFormResponse {
  resource_id: string;
  title: string;
  author_id: string;
}

export interface VoteOnResourcePayload {
  resource_id: string;
  vote_value: 1 | -1;
}

export interface VoteOnResourceResponse {
  vote_id: string;
  resource_id: string;
  value: number;
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

/**
 * Create a new resource
 * Uses POST /api/resources/ - the authenticated user automatically becomes the author
 * Accessible to CONTRIBUTOR, MODERATOR, ADMIN, SUPERADMIN roles
 */
export function useCreateResource() {
  const queryClient = useQueryClient();

  return useMutation<CreateResourceFormResponse, ApiError, CreateResourceFormPayload>({
    mutationFn: async (payload) => {
      // Payload for POST /api/resources/
      // The backend automatically sets the authenticated user as the author
      // file_url is optional and can be provided for the first version
      const resourcePayload: {
        title: string;
        description: string;
        visibility: "public" | "premium" | "private";
        price_cents: number | null;
        tag_ids: string[];
        file_url?: string;
      } = {
        title: payload.title,
        description: payload.description,
        visibility: payload.visibility,
        price_cents: payload.price_cents ?? null,
        tag_ids: payload.tag_ids ?? [],
      };

      // Only include file_url if provided
      if (payload.file_url && payload.file_url.trim()) {
        resourcePayload.file_url = payload.file_url.trim();
      }

      const response = await apiClient.post<ApiResponse<{
        resource_id: string;
        title: string;
        description: string;
        visibility: string;
        price_cents: number | null;
        author_id: string;
        tags: string[];
        created_at: string;
      }>>(
        API_ENDPOINTS.RESOURCES.CREATE,
        resourcePayload
      );

      const resourceData = response.data.data;

      return {
        resource_id: resourceData.resource_id,
        title: resourceData.title,
        author_id: resourceData.author_id,
      };
    },
    onSuccess: () => {
      // Invalidate feed to show new resource
      queryClient.invalidateQueries({ queryKey: resourceKeys.all });
    },
  });
}

/**
 * Vote on a resource (upvote or downvote)
 * Similar pattern to useVoteOnComment
 */
export function useVoteOnResource() {
  const queryClient = useQueryClient();

  return useMutation<VoteOnResourceResponse, ApiError, VoteOnResourcePayload>({
    mutationFn: async (payload) => {
      const response = await apiClient.post<ApiResponse<VoteOnResourceResponse>>(
        API_ENDPOINTS.RESOURCES.VOTE,
        payload
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      // Invalidate resource detail to refresh vote counts
      queryClient.invalidateQueries({ queryKey: resourceKeys.detail(data.resource_id) });
      // Also invalidate feed to update vote counts
      queryClient.invalidateQueries({ queryKey: resourceKeys.all });
    },
  });
}
