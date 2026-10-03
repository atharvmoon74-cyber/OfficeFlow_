/** Quiet Ledger file visuals: semantic type cues use restrained colour and paper-like geometry, never generic imagery. */
import { File, FileSpreadsheet, FileText, Image, Presentation, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { fileAccent, fileTypeLabel, type FileType } from "@/lib/officeflow";

const icons: Record<FileType, LucideIcon> = { document: FileText, spreadsheet: FileSpreadsheet, presentation: Presentation, pdf: File, image: Image, other: File };

export function FileVisual({ type, size = "md", className }: { type: FileType; size?: "sm" | "md" | "lg" | "xl"; className?: string }) {
  const Icon = icons[type];
  return <span className={cn("of-file-visual", `of-file-${size}`, className)} style={{ "--file-accent": fileAccent[type] } as React.CSSProperties}><Icon strokeWidth={size === "sm" ? 2.3 : 1.9} /><em>{type === "presentation" ? "SLD" : type === "spreadsheet" ? "SHT" : type === "document" ? "DOC" : type === "pdf" ? "PDF" : type === "image" ? "IMG" : "FILE"}</em><span className="sr-only">{fileTypeLabel[type]}</span></span>;
}
