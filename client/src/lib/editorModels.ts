/** Quiet Ledger editor foundation: serializable, local-first models shared across document, spreadsheet, and presentation studios. */
export type EditorSaveState = "saved" | "saving" | "unsaved" | "error";
export type StudioKind = "document" | "spreadsheet" | "presentation";

export interface DocumentProject { kind: "document"; html: string; comments: { id: string; author: string; body: string; createdAt: string }[]; version: number; }
export interface SpreadsheetCell { value: string; style?: { bold?: boolean; italic?: boolean; underline?: boolean; align?: "left" | "center" | "right"; fill?: string; format?: "general" | "currency" | "percent" | "number"; decimals?: number; }; }
export interface SpreadsheetSheet { id: string; name: string; cells: Record<string, SpreadsheetCell>; columnWidths: Record<string, number>; rowHeights: Record<string, number>; frozenRows: number; frozenColumns: number; }
export interface SpreadsheetProject { kind: "spreadsheet"; sheets: SpreadsheetSheet[]; activeSheetId: string; chart?: { id: string; type: "bar" | "line" | "pie"; range: string; title: string }; }
export type SlideTheme = "minimal" | "executive" | "academic" | "creative" | "dark" | "elegant" | "modern" | "startup" | "scientific";
export type SlideFormat = "wide" | "standard" | "portrait";
export type SlideElementType = "text" | "shape" | "image" | "line";
export interface SlideElement { id: string; type: SlideElementType; x: number; y: number; width: number; height: number; rotation?: number; text?: string; fill?: string; color?: string; fontSize?: number; bold?: boolean; italic?: boolean; underline?: boolean; strikeout?: boolean; fontFamily?: "Manrope" | "DM Serif Display" | "DM Mono"; align?: "left" | "center" | "right"; letterSpacing?: number; lineHeight?: number; textTransform?: "none" | "uppercase" | "lowercase"; opacity?: number; borderColor?: string; borderWidth?: number; shadow?: boolean; radius?: number; locked?: boolean; hidden?: boolean; name?: string; src?: string; shape?: "rect" | "round" | "circle" | "triangle" | "arrow" | "star" | "line" | "chevron" | "callout"; }
export interface Slide { id: string; name: string; layout: "title" | "content" | "two-column" | "section" | "quote" | "number" | "blank"; elements: SlideElement[]; background?: string; }
export interface PresentationProject { kind: "presentation"; theme: SlideTheme; format: SlideFormat; slides: Slide[]; activeSlideId: string; transition: "fade" | "slide" | "zoom" | "none"; }
export type EditorProject = DocumentProject | SpreadsheetProject | PresentationProject;

export const colLabel = (index: number) => { let label = ""; let current = index + 1; while (current > 0) { const mod = (current - 1) % 26; label = String.fromCharCode(65 + mod) + label; current = Math.floor((current - 1) / 26); } return label; };
export const cellKey = (row: number, col: number) => `${colLabel(col)}${row + 1}`;
export const parseCellKey = (key: string) => { const match = key.match(/^([A-Z]+)(\d+)$/); if (!match) return null; const col = match[1].split("").reduce((total, char) => total * 26 + char.charCodeAt(0) - 64, 0) - 1; return { row: Number(match[2]) - 1, col }; };

export const defaultDocumentHtml = (name: string) => `<h1>${name.replace(/</g, "&lt;")}</h1><p>Start with a clear thought. This document is stored locally in your current browser workspace.</p><h2>Context</h2><p>Use the toolbar to format writing, add a table, insert a link, or bring in an image.</p><blockquote>Good work leaves enough room to think.</blockquote><h2>Next actions</h2><ul><li>Frame the first idea</li><li>Make the important decision</li><li>Share when collaboration is connected</li></ul>`;

export const defaultSpreadsheet = (): SpreadsheetProject => ({ kind: "spreadsheet", activeSheetId: "sheet-1", sheets: [{ id: "sheet-1", name: "Sheet 1", frozenRows: 1, frozenColumns: 0, columnWidths: {}, rowHeights: {}, cells: { A1: { value: "Category", style: { bold: true, fill: "#e7edff" } }, B1: { value: "Planned", style: { bold: true, fill: "#e7edff" } }, C1: { value: "Actual", style: { bold: true, fill: "#e7edff" } }, A2: { value: "Research" }, B2: { value: "2400" }, C2: { value: "2100" }, A3: { value: "Design" }, B3: { value: "1800" }, C3: { value: "1950" }, A4: { value: "Launch" }, B4: { value: "3200" }, C4: { value: "2860" }, A5: { value: "Total", style: { bold: true } }, B5: { value: "=SUM(B2:B4)", style: { bold: true } }, C5: { value: "=SUM(C2:C4)", style: { bold: true } } } }] });

export const presentationThemes: Record<SlideTheme, { name: string; background: string; foreground: string; accent: string; muted: string }> = {
  minimal: { name: "Minimal", background: "#f6f6f2", foreground: "#172235", accent: "#3158c9", muted: "#687385" },
  executive: { name: "Executive", background: "#142037", foreground: "#ffffff", accent: "#8eabff", muted: "#b8c4d6" },
  academic: { name: "Academic", background: "#f3eadc", foreground: "#3a2a1b", accent: "#9b5636", muted: "#735d48" },
  creative: { name: "Creative", background: "#f2ecff", foreground: "#2a174b", accent: "#7252c5", muted: "#735f9d" },
  dark: { name: "Dark", background: "#111827", foreground: "#f2f5f9", accent: "#5b8cff", muted: "#b3c0d3" },
  elegant: { name: "Elegant", background: "#fbf5ef", foreground: "#35291f", accent: "#ad7941", muted: "#786657" },
  modern: { name: "Modern", background: "#edf7f5", foreground: "#123b38", accent: "#16765c", muted: "#55736f" },
  startup: { name: "Startup", background: "#fff2dc", foreground: "#222034", accent: "#ed6a3a", muted: "#766b6a" },
  scientific: { name: "Scientific", background: "#eff7fc", foreground: "#163655", accent: "#2382bd", muted: "#56728b" },
};

export const defaultPresentation = (): PresentationProject => ({ kind: "presentation", theme: "minimal", format: "wide", activeSlideId: "slide-1", transition: "fade", slides: [{ id: "slide-1", name: "Opening", layout: "title", elements: [{ id: "title", type: "text", x: 72, y: 108, width: 780, height: 120, text: "Tell the story clearly.", color: "#172235", fontSize: 47, bold: true }, { id: "subtitle", type: "text", x: 76, y: 258, width: 620, height: 58, text: "A focused OfficeFlow presentation", color: "#687385", fontSize: 20 }, { id: "rule", type: "shape", x: 76, y: 340, width: 170, height: 7, fill: "#3158c9", shape: "round", radius: 8 }] }, { id: "slide-2", name: "Context", layout: "content", elements: [{ id: "title-2", type: "text", x: 70, y: 64, width: 720, height: 72, text: "The opportunity", color: "#172235", fontSize: 36, bold: true }, { id: "body-2", type: "text", x: 76, y: 190, width: 560, height: 230, text: "Use this space to frame the context, show the evidence, and make the next decision easier.", color: "#435068", fontSize: 22 }, { id: "accent-2", type: "shape", x: 730, y: 150, width: 120, height: 270, fill: "#e7edff", shape: "round", radius: 28 }] }] });
