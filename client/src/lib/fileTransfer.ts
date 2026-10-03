/** Quiet Ledger file transfer boundary: validate local files by extension, size, and lightweight signatures before routing them into the browser workspace. */
import type { FileType } from "./officeflow";

const formats: Record<string, FileType> = { doc: "document", docx: "document", txt: "document", xls: "spreadsheet", xlsx: "spreadsheet", csv: "spreadsheet", ppt: "presentation", pptx: "presentation", pdf: "pdf", png: "image", jpg: "image", jpeg: "image", webp: "image", gif: "image" };
export const supportedExtensions = Object.keys(formats);
export const maxImportBytes = 25 * 1024 * 1024;
export const fileTypeFor = (file: File): FileType | null => formats[file.name.split(".").pop()?.toLowerCase() || ""] || null;
export const routeForFile = (type: FileType, id: string) => ["document", "spreadsheet", "presentation", "pdf"].includes(type) ? `/${type}/new?file=${id}` : "/files";

export async function validateImport(file: File): Promise<{ type: FileType; error?: string }> {
  const type = fileTypeFor(file);
  if (!type) return { type: "other", error: "This file type is not supported. Use DOCX, XLSX, PPTX, PDF, CSV, TXT, or an image." };
  if (!file.size) return { type, error: "This file is empty." };
  if (file.size > maxImportBytes) return { type, error: "This file is larger than the 25 MB local browser limit." };
  const bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer()); const text = new TextDecoder().decode(bytes);
  if (type === "pdf" && !text.startsWith("%PDF")) return { type, error: "This does not appear to be a valid PDF file." };
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  if (["docx", "xlsx", "pptx"].includes(extension) && !(bytes[0] === 0x50 && bytes[1] === 0x4b)) return { type, error: "This Office file has an invalid archive signature." };
  if (type === "image" && !file.type.startsWith("image/")) return { type, error: "This image file has an invalid browser MIME type." };
  return { type };
}
