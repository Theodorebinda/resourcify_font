import { fetchArticles } from "@/src/services/resource-service";
import { Article } from "@/src/types/article";
import { useQuery } from "@tanstack/react-query";

const ARTICLES_QUERY_KEY = ["articles"];

export const useArticles = () =>
  useQuery<Article[]>({
    queryKey: ARTICLES_QUERY_KEY,
    queryFn: fetchArticles,
    staleTime: 5 * 60 * 1000,
  });
