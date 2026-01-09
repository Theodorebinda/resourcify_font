import { fetchDocuments } from "@/src/services/resource-service";
import { DocumentAsset, ResourceCategory } from "@/src/types/resource";
import { useQuery } from "@tanstack/react-query";

const DOCUMENTS_QUERY_KEY = ["documents"];

export const useDocuments = () =>
  useQuery<Record<ResourceCategory, DocumentAsset[]>>({
    queryKey: DOCUMENTS_QUERY_KEY,
    queryFn: fetchDocuments,
    staleTime: 10 * 60 * 1000,
  });
