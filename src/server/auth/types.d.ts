import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    employeeId?: string | null;
    roleId?: string;
    roleName?: string;
    permissions?: string[];
  }

  interface Session {
    user: {
      id: string;
      employeeId: string | null;
      roleId: string;
      roleName: string;
      permissions: string[];
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    employeeId: string | null;
    roleId: string;
    roleName: string;
    permissions: string[];
  }
}
