import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { AuthService } from "@/features/auth/auth-service";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? "dev-auth-secret",
  trustHost: true,
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/sign-in"
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email"
        },
        password: {
          label: "Password",
          type: "password"
        }
      },
      async authorize(credentials) {
        const user = await AuthService.authorize(credentials);

        if (!user) {
          return null;
        }

        const activeWorkspaceId = await AuthService.getPrimaryWorkspaceId(user.id);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          activeWorkspaceId
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        token.activeWorkspaceId = user.activeWorkspaceId ?? null;
      }

      if (trigger === "update" && session?.user?.activeWorkspaceId) {
        token.activeWorkspaceId = session.user.activeWorkspaceId;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.activeWorkspaceId =
          typeof token.activeWorkspaceId === "string" ? token.activeWorkspaceId : null;
      }

      return session;
    }
  }
});
