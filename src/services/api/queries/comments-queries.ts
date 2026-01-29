/**
 * TanStack Query hooks for Comments
 * 
 * Handles comment voting
 */

import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../client";
import { API_ENDPOINTS } from "../../../constants/api";
import type { ApiError, ApiResponse } from "../../../types";

// Types
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
 * Vote on a comment (upvote or downvote)
 */
export function useVoteOnComment() {
  return useMutation<VoteOnCommentResponse, ApiError, VoteOnCommentPayload>({
    mutationFn: async (payload) => {
      const response = await apiClient.post<ApiResponse<VoteOnCommentResponse>>(
        API_ENDPOINTS.COMMENTS.VOTE,
        payload
      );
      return response.data.data;
    },
  });
}
