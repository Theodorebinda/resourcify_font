/**
 * TanStack Query hooks for Comments
 * 
 * Handles comment fetching, creation and voting
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client";
import { API_ENDPOINTS } from "../../../constants/api";
import type { ApiError, ApiResponse } from "../../../types";
import { resourceKeys } from "./resources-queries";

// Types
export interface CommentAuthor {
  id: string;
  username: string;
  avatar_url: string | null;
}

export interface CommentStats {
  upvotes: number;
  downvotes: number;
  total_votes: number;
}

export interface Comment {
  id: string;
  content: string;
  author: CommentAuthor;
  stats: CommentStats;
  created_at: string;
  updated_at: string;
}

export interface CommentsPagination {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface ResourceCommentsResponse {
  data: Comment[];
  pagination: CommentsPagination;
}

export interface CreateCommentPayload {
  resource_id: string;
  content: string;
}

export interface CreateCommentResponse {
  comment_id: string;
  resource_id: string;
  author_id: string;
  content: string;
  created_at: string;
}

// Query keys
export const commentKeys = {
  all: ["comments"] as const,
  resource: (resourceId: string) => [...commentKeys.all, "resource", resourceId] as const,
  resourcePage: (resourceId: string, page: number, pageSize: number) =>
    [...commentKeys.resource(resourceId), page, pageSize] as const,
};

/**
 * Get comments for a resource with pagination
 */
export function useResourceComments(
  resourceId: string,
  page: number = 1,
  pageSize: number = 20
) {
  return useQuery<ResourceCommentsResponse, ApiError>({
    queryKey: commentKeys.resourcePage(resourceId, page, pageSize),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      const response = await apiClient.get<ResourceCommentsResponse>(
        `${API_ENDPOINTS.RESOURCES.COMMENTS(resourceId)}?${params}`
      );
      return response.data;
    },
    enabled: !!resourceId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export interface VoteOnCommentPayload {
  comment_id: string;
  vote_value: 1 | -1;
}

export interface VoteOnCommentResponse {
  vote_id: string;
  comment_id: string;
  value: number;
}

/**
 * Create a comment on a resource
 */
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation<CreateCommentResponse, ApiError, CreateCommentPayload>({
    mutationFn: async (payload) => {
      const response = await apiClient.post<ApiResponse<CreateCommentResponse>>(
        API_ENDPOINTS.COMMENTS.CREATE,
        payload
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      // Invalidate resource detail to refetch with new comment
      queryClient.invalidateQueries({ queryKey: resourceKeys.detail(data.resource_id) });
      // Invalidate comments for this resource
      queryClient.invalidateQueries({ queryKey: commentKeys.resource(data.resource_id) });
      // Also invalidate feed to update comment counts
      queryClient.invalidateQueries({ queryKey: resourceKeys.all });
    },
  });
}

/**
 * Vote on a comment (upvote or downvote)
 */
export function useVoteOnComment() {
  const queryClient = useQueryClient();

  return useMutation<VoteOnCommentResponse, ApiError, VoteOnCommentPayload>({
    mutationFn: async (payload) => {
      const response = await apiClient.post<ApiResponse<VoteOnCommentResponse>>(
        API_ENDPOINTS.COMMENTS.VOTE,
        payload
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      // Invalidate comments queries to refresh vote counts
      // We need to invalidate all comment queries since we don't know which resource
      queryClient.invalidateQueries({ queryKey: commentKeys.all });
      // Also invalidate resource queries
      queryClient.invalidateQueries({ queryKey: resourceKeys.all });
    },
  });
}
