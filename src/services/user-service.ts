import { User } from "@/src/types/user";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const fallbackUsers: User[] = [
  {
    id: "1",
    name: "Alice",
    email: "alice@example.com",
    image: "https://i.pravatar.cc/80?img=1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Bob",
    email: "bob@example.com",
    image: "https://i.pravatar.cc/80?img=2",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Charlie",
    email: "charlie@example.com",
    image: "https://i.pravatar.cc/80?img=3",
    createdAt: new Date().toISOString(),
  },
];

export const fetchUsers = async (): Promise<User[]> => {
  if (!API_BASE_URL) {
    return fallbackUsers;
  }

  const response = await fetch(`${API_BASE_URL}/users`, {
    next: { revalidate: 120 },
  });

  if (!response.ok) {
    return fallbackUsers;
  }

  const payload = (await response.json()) as User[];
  return payload.length ? payload : fallbackUsers;
};
