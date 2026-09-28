import { describe, expect, it } from "vitest";
import { validateDocumentFile, InvalidFileError } from "@/server/storage/file-validation";

const PDF_BYTES = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]); // "%PDF-1.4"
const PNG_BYTES = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPG_BYTES = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);

describe("validateDocumentFile", () => {
  it("accepts a genuine PDF with a .pdf extension", async () => {
    await expect(validateDocumentFile("contract.pdf", PDF_BYTES)).resolves.toBeUndefined();
  });

  it("accepts a genuine PNG/JPG image", async () => {
    await expect(validateDocumentFile("scan.png", PNG_BYTES)).resolves.toBeUndefined();
    await expect(validateDocumentFile("photo.jpg", JPG_BYTES)).resolves.toBeUndefined();
  });

  it("rejects a disguised executable renamed to .pdf", async () => {
    const fakePdf = Buffer.from("MZ\x90\x00this is actually an executable, not a PDF");
    await expect(validateDocumentFile("resume.pdf", fakePdf)).rejects.toThrow(InvalidFileError);
  });

  it("rejects an unsupported extension outright, before checking content", async () => {
    await expect(validateDocumentFile("script.exe", PDF_BYTES)).rejects.toThrow(InvalidFileError);
    await expect(validateDocumentFile("page.html", Buffer.from("<html></html>"))).rejects.toThrow(
      InvalidFileError,
    );
  });

  it("rejects an empty file", async () => {
    await expect(validateDocumentFile("empty.pdf", Buffer.alloc(0))).rejects.toThrow(InvalidFileError);
  });

  it("rejects a file over the 10MB limit", async () => {
    const big = Buffer.concat([PDF_BYTES, Buffer.alloc(11 * 1024 * 1024)]);
    await expect(validateDocumentFile("big.pdf", big)).rejects.toThrow(InvalidFileError);
  });
});
