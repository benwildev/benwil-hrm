import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          include: {
            role: { include: { permissions: { include: { permission: true } } } },
            employee: true,
          },
        });

        if (!user || user.status !== "ACTIVE") {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.employee?.fullName ?? user.email,
          employeeId: user.employee?.id ?? null,
          roleId: user.roleId,
          roleName: user.role.name,
          permissions: user.role.permissions.map((rp) => rp.permission.key),
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.employeeId = user.employeeId as string | null;
        token.roleId = user.roleId as string;
        token.roleName = user.roleName as string;
        token.permissions = user.permissions as string[];
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.employeeId = token.employeeId as string | null;
      session.user.roleId = token.roleId as string;
      session.user.roleName = token.roleName as string;
      session.user.permissions = token.permissions as string[];
      return session;
    },
  },
});
