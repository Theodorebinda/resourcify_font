/**
 * TanStack Query hooks for Comments
 * 
 * Handles comment creation and voting
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client";
import { API_ENDPOINTS } from "../../../constants/api";
import type { ApiError, ApiResponse } from "../../../types";
import { resourceKeys } from "./resources-queries";

// Types
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
    onSuccess: () => {
      // Invalidate all resource queries to refresh comment votes
      // This will update the resource detail page with new vote counts
      queryClient.invalidateQueries({ queryKey: resourceKeys.all });
    },
  });
}
