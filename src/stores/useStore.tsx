import { create } from "zustand";
import { User } from "../models/users";

interface UserState {
  users: User[];
  setUsers: (users: User[]) => void;
}

const useUserStore = create<UserState>((set) => ({
  users: [],
  setUsers: (users) => set({ users }),
}));

export default useUserStore;
