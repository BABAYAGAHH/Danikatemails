import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      activeWorkspaceId: string | null;
    };
  }

  interface User {
    id: string;
    activeWorkspaceId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    activeWorkspaceId?: string | null;
  }
}
