"use server";

import { revalidatePath } from "next/cache";
import { addEmployeeDocument, deleteEmployeeDocument } from "@/server/dal/documents";

export type DocumentFormState = { error: string } | undefined;

export async function uploadDocumentAction(
  employeeId: string,
  _prevState: DocumentFormState,
  formData: FormData,
): Promise<DocumentFormState> {
  const documentType = formData.get("documentType");
  const documentName = formData.get("documentName");
  const notes = formData.get("notes");
  const file = formData.get("file");

  if (typeof documentType !== "string" || !documentType.trim()) {
    return { error: "Document type is required." };
  }
  if (typeof documentName !== "string" || !documentName.trim()) {
    return { error: "Document name is required." };
  }
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose a file to upload." };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { error: "File must be smaller than 10 MB." };
  }

  const data = Buffer.from(await file.arrayBuffer());

  try {
    await addEmployeeDocument({
      employeeId,
      documentType: documentType.trim(),
      documentName: documentName.trim(),
      notes: typeof notes === "string" && notes.trim() ? notes.trim() : undefined,
      fileName: file.name,
      data,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to upload document." };
  }

  revalidatePath(`/employees/${employeeId}`);
}

export async function deleteDocumentAction(employeeId: string, documentId: string) {
  await deleteEmployeeDocument(documentId);
  revalidatePath(`/employees/${employeeId}`);
}
