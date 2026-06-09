/**
 * TanStack Query hooks for Tags (Public)
 * 
 * Public tags endpoint for onboarding and general use
 */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../client";
import { API_ENDPOINTS } from "../../../constants/api";
import type { ApiError } from "../../../types";

// Query keys
export const tagKeys = {
  all: ["tags"] as const,
  list: () => [...tagKeys.all, "list"] as const,
};

// Types
export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface TagsListResponse {
  status: "ok";
  data: Tag[];
  count: number;
}

/**
 * Get all tags (public endpoint)
 * 
 * Used for onboarding interests selection and other public features
 * 
 * Response structure:
 * {
 *   "status": "ok",
 *   "data": [...],
 *   "count": number
 * }
 */
export function useTags() {
  return useQuery<Tag[], ApiError>({
    queryKey: tagKeys.list(),
    queryFn: async () => {
      const response = await apiClient.get<TagsListResponse>(
        API_ENDPOINTS.TAGS.LIST
      );
      // La réponse a la structure { status: "ok", data: [...], count: number }
      // On extrait data qui est un tableau de tags
      const data = response.data;
      if (data && data.status === "ok" && Array.isArray(data.data)) {
        return data.data;
      }
      // Fallback si la structure est différente
      return [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - les tags changent rarement
  });
}
