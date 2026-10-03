/** Quiet Ledger PDF contracts: serializable page and annotation state is kept separate from actual PDF bytes in IndexedDB. */
export type PdfAnnotationKind = "highlight" | "underline" | "strikeout" | "draw" | "text" | "rectangle" | "circle" | "arrow";
export interface PdfAnnotation { id: string; page: number; kind: PdfAnnotationKind; x: number; y: number; width: number; height: number; color: string; text?: string; }
export interface PdfProject { kind: "pdf"; title: string; pageCount: number; activePage: number; zoom: number; rotations: Record<number, number>; annotations: PdfAnnotation[]; textByPage: string[]; source: "blank" | "import" | "generated"; }
export const emptyPdfProject = (title: string): PdfProject => ({ kind: "pdf", title, pageCount: 1, activePage: 0, zoom: 1, rotations: {}, annotations: [], textByPage: [""], source: "blank" });
