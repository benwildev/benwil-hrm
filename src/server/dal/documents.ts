import { prisma } from "@/lib/prisma";
import { requireEmployeeAccess } from "@/server/dal/session";
import { PERMISSIONS } from "@/lib/permissions";
import { storage, buildDocumentKey } from "@/server/storage";
import { validateDocumentFile } from "@/server/storage/file-validation";
import { logAudit } from "@/server/audit/audit";

// Every function here is gated by requireEmployeeAccess: the acting user
// must either own the employeeId in question or hold EMPLOYEES_MANAGE.
// DOCUMENTS_CREATE/DOCUMENTS_MANAGE alone is NOT enough on its own — that
// permission is granted to every base "Employee" role by default (so staff
// can upload their own documents), so it must never be treated as "can
// touch any employee's documents."

export async function addEmployeeDocument(params: {
  employeeId: string;
  documentType: string;
  documentName: string;
  notes?: string;
  fileName: string;
  data: Buffer;
}) {
  const user = await requireEmployeeAccess(params.employeeId, PERMISSIONS.EMPLOYEES_MANAGE);
  await validateDocumentFile(params.fileName, params.data);

  const key = buildDocumentKey(params.employeeId, params.fileName);
  const stored = await storage.upload({ key, data: params.data });

  const doc = await prisma.employeeDocument.create({
    data: {
      employeeId: params.employeeId,
      documentType: params.documentType,
      documentName: params.documentName,
      notes: params.notes,
      fileUrl: stored.url,
    },
  });

  await logAudit({
    actorId: user.id,
    action: "DOCUMENT_UPLOADED",
    entityType: "EmployeeDocument",
    entityId: doc.id,
    newData: { employeeId: params.employeeId, documentType: params.documentType, documentName: params.documentName },
  });

  return doc;
}

export async function deleteEmployeeDocument(documentId: string) {
  const doc = await prisma.employeeDocument.findUniqueOrThrow({ where: { id: documentId } });
  const user = await requireEmployeeAccess(doc.employeeId, PERMISSIONS.EMPLOYEES_MANAGE);

  const key = doc.fileUrl.replace("/api/files/", "");
  await storage.delete(key);
  await prisma.employeeDocument.delete({ where: { id: documentId } });

  await logAudit({
    actorId: user.id,
    action: "DOCUMENT_DELETED",
    entityType: "EmployeeDocument",
    entityId: documentId,
    oldData: { employeeId: doc.employeeId, documentType: doc.documentType, documentName: doc.documentName },
  });
}

export async function getDocumentForDownload(key: string) {
  const doc = await prisma.employeeDocument.findFirst({
    where: { fileUrl: `/api/files/${key}` },
  });
  if (!doc) return null;

  await requireEmployeeAccess(doc.employeeId, PERMISSIONS.EMPLOYEES_MANAGE);

  const data = await storage.download(key);
  return { data, fileName: doc.documentName };
}
