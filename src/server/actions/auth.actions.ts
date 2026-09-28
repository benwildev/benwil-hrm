"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/server/auth/auth";

export type LoginState = { error: string } | undefined;

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");
  const callbackUrl = formData.get("callbackUrl");

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: typeof callbackUrl === "string" && callbackUrl ? callbackUrl : "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin" && (error as { code?: string }).code === "rate_limited") {
        return { error: "Too many failed sign-in attempts. Please try again in a few minutes." };
      }
      return { error: "Invalid email or password." };
    }
    throw error;
  }
}

export async function changeOwnPasswordAction(
  currentPassword: string,
  newPassword: string,
) {
  const { updateOwnPassword } = await import("@/server/dal/roles");
  await updateOwnPassword(currentPassword, newPassword);
}

