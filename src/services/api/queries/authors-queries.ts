/**
 * TanStack Query hooks for Authors
 * 
 * Handles author profile retrieval
 */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../client";
import { API_ENDPOINTS } from "../../../constants/api";
import type { ApiError, ApiResponse } from "../../../types";

// Query keys
export const authorKeys = {
  all: ["authors"] as const,
  profile: (userId: string) => [...authorKeys.all, "profile", userId] as const,
};

// Types
export interface AuthorProfile {
  id: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  stats: {
    total_resources: number;
    total_views: number;
  };
  recent_resources: Array<{
    id: string;
    title: string;
    created_at: string;
  }>;
}

/**
 * Get author profile
 */
export function useAuthorProfile(userId: string) {
  return useQuery<AuthorProfile, ApiError>({
    queryKey: authorKeys.profile(userId),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<AuthorProfile>>(
        API_ENDPOINTS.AUTHORS.PROFILE(userId)
      );
      return response.data.data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
