"use server";

import { revalidatePath } from "next/cache";
import {
  createRole,
  deleteRole,
  renameRole,
  updateRolePermissions,
} from "@/server/dal/roles";

export type RoleFormState = { error: string } | { success: true } | undefined;

export async function createRoleAction(
  _prevState: RoleFormState,
  formData: FormData,
): Promise<RoleFormState> {
  const name = formData.get("name");
  const description = formData.get("description");

  if (typeof name !== "string" || name.trim().length === 0) {
    return { error: "Role name is required." };
  }

  try {
    await createRole({
      name: name.trim(),
      description: typeof description === "string" ? description.trim() : undefined,
    });
  } catch {
    return { error: "A role with that name already exists." };
  }

  revalidatePath("/settings/roles");
  return { success: true };
}

export async function renameRoleAction(
  roleId: string,
  _prevState: RoleFormState,
  formData: FormData,
): Promise<RoleFormState> {
  const name = formData.get("name");
  const description = formData.get("description");

  if (typeof name !== "string" || name.trim().length === 0) {
    return { error: "Role name is required." };
  }

  try {
    await renameRole(roleId, {
      name: name.trim(),
      description: typeof description === "string" ? description.trim() : undefined,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to update role." };
  }

  revalidatePath("/settings/roles");
  revalidatePath(`/settings/roles/${roleId}`);
}

export async function updateRolePermissionsAction(roleId: string, permissionIds: string[]) {
  await updateRolePermissions(roleId, permissionIds);
  revalidatePath(`/settings/roles/${roleId}`);
  revalidatePath("/settings/roles");
}

export async function deleteRoleAction(roleId: string) {
  await deleteRole(roleId);
  revalidatePath("/settings/roles");
}
