// Content-based validation for employee document uploads. A client-supplied
// filename extension or MIME string is trivial to spoof, so this checks the
// actual file bytes (magic numbers) against the extension the file claims to
// have, and rejects anything outside the small set of formats an HRM
// actually needs to store (personnel documents, scans, contracts).

const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024; // 10 MB, mirrors the action-layer check

const ALLOWED_EXTENSIONS = new Set([
  "pdf",
  "jpg",
  "jpeg",
  "png",
  "webp",
  "doc",
  "docx",
  "xls",
  "xlsx",
]);

function matchesSignature(data: Buffer, signature: number[], offset = 0) {
  if (data.length < offset + signature.length) return false;
  for (let i = 0; i < signature.length; i++) {
    if (data[offset + i] !== signature[i]) return false;
  }
  return true;
}

function isPdf(data: Buffer) {
  return matchesSignature(data, [0x25, 0x50, 0x44, 0x46]); // %PDF
}
function isPng(data: Buffer) {
  return matchesSignature(data, [0x89, 0x50, 0x4e, 0x47]);
}
function isJpg(data: Buffer) {
  return matchesSignature(data, [0xff, 0xd8, 0xff]);
}
function isWebp(data: Buffer) {
  return matchesSignature(data, [0x52, 0x49, 0x46, 0x46]) && matchesSignature(data, [0x57, 0x45, 0x42, 0x50], 8);
}
// Modern .docx/.xlsx are zip archives (PK\x03\x04); legacy .doc/.xls are OLE
// compound files (D0 CF 11 E0). Both are accepted for either extension since
// we don't need to distinguish the office-format version, only rule out
// something that isn't actually an office document/PDF/image.
function isZipBased(data: Buffer) {
  return matchesSignature(data, [0x50, 0x4b, 0x03, 0x04]);
}
function isOleCompound(data: Buffer) {
  return matchesSignature(data, [0xd0, 0xcf, 0x11, 0xe0]);
}

export class InvalidFileError extends Error {}

export async function validateDocumentFile(fileName: string, data: Buffer): Promise<void> {
  if (data.length === 0) {
    throw new InvalidFileError("The uploaded file is empty.");
  }
  if (data.length > MAX_DOCUMENT_BYTES) {
    throw new InvalidFileError("File must be smaller than 10 MB.");
  }

  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    throw new InvalidFileError(
      "Unsupported file type. Allowed formats: PDF, JPG, PNG, WEBP, DOC, DOCX, XLS, XLSX.",
    );
  }

  const contentMatchesExtension = (() => {
    switch (extension) {
      case "pdf":
        return isPdf(data);
      case "png":
        return isPng(data);
      case "jpg":
      case "jpeg":
        return isJpg(data);
      case "webp":
        return isWebp(data);
      case "doc":
      case "xls":
        return isOleCompound(data) || isZipBased(data);
      case "docx":
      case "xlsx":
        return isZipBased(data);
      default:
        return false;
    }
  })();

  if (!contentMatchesExtension) {
    throw new InvalidFileError(
      "The file's content doesn't match its extension. Please upload a genuine PDF, image, or office document.",
    );
  }
}
