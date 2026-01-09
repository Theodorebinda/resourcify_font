import { fetchUsers } from "@/src/services/user-service";
import { User } from "@/src/types/user";
import { useQuery } from "@tanstack/react-query";

const USERS_QUERY_KEY = ["users"];

export const useUsers = () =>
  useQuery<User[]>({
    queryKey: USERS_QUERY_KEY,
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000,
  });
