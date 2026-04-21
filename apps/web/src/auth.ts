import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@repo/db";
import bcrypt from "bcryptjs";
import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";

import { env } from "./lib/env";

const providers: NextAuthConfig["providers"] = [
  Credentials({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      const credentialsSchema = z.object({
        email: z.string().email(),
        password: z.string().min(1)
      });

      const parsedCredentials = credentialsSchema.safeParse(credentials);

      if (!parsedCredentials.success) {
        return null;
      }

      const { email, password } = parsedCredentials.data;

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (!user?.passwordHash) {
        return null;
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);

      if (!isValid) {
        return null;
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        subscriptionPlan: user.subscriptionPlan,
        verificationStatus: user.verificationStatus
      };
    }
  })
];

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt"
  },
  secret: env.AUTH_SECRET,
  pages: {
    signIn: "/sign-in"
  },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.subscriptionPlan = user.subscriptionPlan;
        token.verificationStatus = user.verificationStatus;
      }

      if (token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            role: true,
            subscriptionPlan: true,
            verificationStatus: true,
            name: true,
            email: true,
            image: true
          }
        });

        if (dbUser) {
          token.role = dbUser.role;
          token.subscriptionPlan = dbUser.subscriptionPlan;
          token.verificationStatus = dbUser.verificationStatus;
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.picture = dbUser.image;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as string) ?? "MEMBER";
        session.user.subscriptionPlan = (token.subscriptionPlan as string) ?? "FREE";
        session.user.verificationStatus = (token.verificationStatus as string) ?? "UNVERIFIED";
      }

      return session;
    },
    authorized({ auth: authData, request }) {
      const pathname = request.nextUrl.pathname;
      const protectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/chat");

      if (!protectedRoute) {
        return true;
      }

      return Boolean(authData?.user);
    }
  }
});
