// hooks/useUsers.ts
import { useEffect } from "react";
import useUserStore from "../stores/useStore";

const useUsers = () => {
  const { setUsers } = useUserStore();

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch("http://localhost:3000/users");
      const data = await response.json();
      setUsers(data); // Mise à jour de l'état global avec Zustand
    };

    fetchUsers();
  }, [setUsers]);
};

export default useUsers;
