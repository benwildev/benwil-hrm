import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isLoginRateLimited, recordFailedLogin, clearLoginAttempts } from "@/server/auth/rate-limit";
import { logAudit } from "@/server/audit/audit";

export class RateLimitedSignInError extends CredentialsSignin {
  code = "rate_limited";
}

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
      authorize: async (credentials, request) => {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        const ip = request?.headers?.get("x-forwarded-for")?.split(",")[0]?.trim()
          ?? request?.headers?.get("x-real-ip")
          ?? null;

        if (isLoginRateLimited(email, ip)) {
          throw new RateLimitedSignInError();
        }

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          include: {
            role: { include: { permissions: { include: { permission: true } } } },
            employee: true,
          },
        });

        if (!user || user.status !== "ACTIVE") {
          recordFailedLogin(email, ip);
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          recordFailedLogin(email, ip);
          await logAudit({ actorId: user.id, action: "LOGIN_FAILED", entityType: "User", entityId: user.id });
          return null;
        }

        clearLoginAttempts(email, ip);

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });
        await logAudit({ actorId: user.id, action: "LOGIN_SUCCEEDED", entityType: "User", entityId: user.id });

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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.employeeId = (user.employeeId as string | null) ?? null;
        token.roleId = user.roleId as string;
        token.roleName = user.roleName as string;
        token.permissions = user.permissions as string[];
      } else if (token.id) {
        try {
          const freshUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            include: {
              role: { include: { permissions: { include: { permission: true } } } },
              employee: { select: { id: true } },
            },
          });
          if (freshUser) {
            token.roleId = freshUser.roleId;
            token.roleName = freshUser.role.name;
            token.permissions = freshUser.role.permissions.map((rp) => rp.permission.key);
            token.employeeId = freshUser.employee?.id ?? null;
          }
        } catch {
          // ignore DB error in jwt callback
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.employeeId = (token.employeeId as string | null) ?? null;
      session.user.roleId = token.roleId as string;
      session.user.roleName = token.roleName as string;
      session.user.permissions = (token.permissions as string[]) ?? [];

      if (!session.user.employeeId && session.user.id) {
        try {
          const emp = await prisma.employee.findUnique({
            where: { userId: session.user.id },
            select: { id: true },
          });
          if (emp) {
            session.user.employeeId = emp.id;
          }
        } catch {
          // ignore
        }
      }

      return session;
    },
  },
});
