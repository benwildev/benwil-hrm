import { prisma } from "@/lib/prisma";
import { requirePermission, requireUser } from "@/server/dal/session";
import { PERMISSIONS } from "@/lib/permissions";
import { storage, buildDocumentKey } from "@/server/storage";

export async function addEmployeeDocument(params: {
  employeeId: string;
  documentType: string;
  documentName: string;
  notes?: string;
  fileName: string;
  data: Buffer;
}) {
  await requirePermission(PERMISSIONS.DOCUMENTS_MANAGE);

  const key = buildDocumentKey(params.employeeId, params.fileName);
  const stored = await storage.upload({ key, data: params.data });

  return prisma.employeeDocument.create({
    data: {
      employeeId: params.employeeId,
      documentType: params.documentType,
      documentName: params.documentName,
      notes: params.notes,
      fileUrl: stored.url,
    },
  });
}

export async function deleteEmployeeDocument(documentId: string) {
  await requirePermission(PERMISSIONS.DOCUMENTS_MANAGE);
  const doc = await prisma.employeeDocument.findUniqueOrThrow({ where: { id: documentId } });
  const key = doc.fileUrl.replace("/api/files/", "");
  await storage.delete(key);
  await prisma.employeeDocument.delete({ where: { id: documentId } });
}

export async function getDocumentForDownload(key: string) {
  const user = await requireUser();
  const doc = await prisma.employeeDocument.findFirst({
    where: { fileUrl: `/api/files/${key}` },
  });
  if (!doc) return null;

  const canViewAll = user.permissions.includes(PERMISSIONS.EMPLOYEES_VIEW);
  const isOwnDocument = user.employeeId && user.employeeId === doc.employeeId;
  if (!canViewAll && !isOwnDocument) return null;

  const data = await storage.download(key);
  return { data, fileName: doc.documentName };
}
