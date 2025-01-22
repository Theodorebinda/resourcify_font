export interface User {
  id: number;
  name: string;
  email: string;
  image?: string;
  password: string;
  isActive: boolean;
  isAdmin: boolean;
  resources: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  favorites: string[];
}

export class Convert {
  public static toUser(json: string): User {
    const parsed = JSON.parse(json);
    if (this.isUser(parsed)) {
      throw new Error("Invalid User object");
    }
    return parsed as User;
  }

  public static userToJson(value: User): string {
    return JSON.stringify(value, null, 2);
  }

  private static isUser(obj: unknown): obj is User {
    if (typeof obj !== "object" || obj === null) return false;

    const user = obj as User;

    return (
      typeof user.id === "number" &&
      typeof user.name === "string" &&
      typeof user.email === "string" &&
      (user.image === undefined || typeof user.image === "string") &&
      typeof user.password === "string" &&
      typeof user.isActive === "boolean" &&
      typeof user.isAdmin === "boolean" &&
      typeof user.resources === "string" &&
      typeof user.role === "string" &&
      typeof user.createdAt === "string" &&
      typeof user.updatedAt === "string" &&
      Array.isArray(user.favorites) &&
      user.favorites.every((item) => typeof item === "string")
    );
  }
}
