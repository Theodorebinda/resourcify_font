import { fetchHello } from "@/src/services/hello-service";
import { HelloMessage } from "@/src/types/hello";
import { useQuery } from "@tanstack/react-query";

const HELLO_QUERY_KEY = ["hello"];

export const useHello = () =>
  useQuery<HelloMessage>({
    queryKey: HELLO_QUERY_KEY,
    queryFn: fetchHello,
    staleTime: 5 * 60 * 1000,
  });
