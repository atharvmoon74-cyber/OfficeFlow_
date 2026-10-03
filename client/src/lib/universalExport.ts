/** Quiet Ledger export boundary: editors report real browser downloads separately from formats that require a dedicated conversion service. */
import type { FileType } from "./officeflow";

export type ExportFormat = "pdf" | "docx" | "txt" | "xlsx" | "csv" | "pptx";
export type ExportResult = { status: "downloaded"; message: string } | { status: "unavailable"; message: string } | { status: "error"; message: string };
export interface ExportRequest { type: FileType; format: ExportFormat; filename: string; }
const browserFormats: Partial<Record<FileType, ExportFormat[]>> = { document: ["pdf", "docx"], spreadsheet: ["pdf", "xlsx", "csv"], pdf: ["pdf"] };
export const canExportInBrowser = (request: ExportRequest) => (browserFormats[request.type] || []).includes(request.format);
export const unavailableExport = (request: ExportRequest): ExportResult => ({ status: "unavailable", message: `${request.format.toUpperCase()} export for ${request.type} files requires the conversion service to be configured.` });
export const exportFormatsFor = (type: FileType): ExportFormat[] => type === "document" ? ["pdf", "docx", "txt"] : type === "spreadsheet" ? ["xlsx", "csv", "pdf"] : type === "presentation" ? ["pptx", "pdf"] : type === "pdf" ? ["pdf"] : [];
