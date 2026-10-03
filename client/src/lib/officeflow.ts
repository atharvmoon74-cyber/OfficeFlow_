/** Quiet Ledger foundation: centralized OfficeFlow models, seed data, and backend-ready service seams. */

export type FileType = "document" | "spreadsheet" | "presentation" | "pdf" | "image" | "other";
export type FileView = "grid" | "list";

export interface OfficeUser { id: string; name: string; email: string; avatar?: string; createdAt: string; }
export interface OfficeFile {
  id: string; name: string; type: FileType; ownerId: string; parentFolderId: string | null;
  size: number; createdAt: string; updatedAt: string; starred: boolean; trashed: boolean;
  shared?: boolean; source?: "seed" | "local";
}
export interface OfficeFolder { id: string; name: string; ownerId: string; parentFolderId: string | null; createdAt: string; updatedAt: string; }
export interface OfficeTemplate { id: string; name: string; type: FileType; category: string; description: string; accent: string; }
export interface WorkspaceSnapshot { user: OfficeUser; files: OfficeFile[]; folders: OfficeFolder[]; viewMode: FileView; }

export const fileTypeLabel: Record<FileType, string> = {
  document: "Document", spreadsheet: "Spreadsheet", presentation: "Presentation", pdf: "PDF", image: "Image", other: "File",
};

export const fileAccent: Record<FileType, string> = {
  document: "#3158C9", spreadsheet: "#16765C", presentation: "#B95622", pdf: "#B73B43", image: "#8063C4", other: "#4E5969",
};

export const freshId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export const initialSnapshot: WorkspaceSnapshot = {
  user: { id: "local-user", name: "Workspace member", email: "local-preview@officeflow.app", createdAt: "2026-08-22" },
  viewMode: "list",
  folders: [
    { id: "f-work", name: "Work projects", ownerId: "local-user", parentFolderId: null, createdAt: "2026-08-01", updatedAt: "2026-08-20" },
    { id: "f-personal", name: "Personal", ownerId: "local-user", parentFolderId: null, createdAt: "2026-08-02", updatedAt: "2026-08-19" },
    { id: "f-research", name: "Research", ownerId: "local-user", parentFolderId: "f-work", createdAt: "2026-08-03", updatedAt: "2026-08-21" },
  ],
  files: [
    { id: "doc-q3", name: "Q3 planning brief", type: "document", ownerId: "local-user", parentFolderId: "f-work", size: 32800, createdAt: "2026-08-13", updatedAt: "2026-08-22", starred: true, trashed: false, source: "seed" },
    { id: "sheet-budget", name: "Operating budget 2026", type: "spreadsheet", ownerId: "local-user", parentFolderId: "f-work", size: 187000, createdAt: "2026-08-09", updatedAt: "2026-08-21", starred: false, trashed: false, shared: true, source: "seed" },
    { id: "slides-launch", name: "Product launch narrative", type: "presentation", ownerId: "local-user", parentFolderId: "f-work", size: 802000, createdAt: "2026-08-11", updatedAt: "2026-08-20", starred: false, trashed: false, source: "seed" },
    { id: "pdf-contract", name: "Partner agreement", type: "pdf", ownerId: "local-user", parentFolderId: null, size: 1250000, createdAt: "2026-08-04", updatedAt: "2026-08-18", starred: true, trashed: false, shared: true, source: "seed" },
    { id: "doc-notes", name: "Research interview notes", type: "document", ownerId: "local-user", parentFolderId: "f-research", size: 16400, createdAt: "2026-08-15", updatedAt: "2026-08-18", starred: false, trashed: false, source: "seed" },
    { id: "pdf-invoice", name: "August invoice", type: "pdf", ownerId: "local-user", parentFolderId: "f-personal", size: 493000, createdAt: "2026-08-01", updatedAt: "2026-08-12", starred: false, trashed: false, source: "seed" },
    { id: "old-brief", name: "Archive — July brief", type: "document", ownerId: "local-user", parentFolderId: "f-work", size: 28400, createdAt: "2026-07-21", updatedAt: "2026-07-30", starred: false, trashed: true, source: "seed" },
  ],
};

import { presentationTemplateCatalog } from "./presentationTemplates";

export const templates: OfficeTemplate[] = [
  { id: "t-resume", name: "Professional resume", type: "document", category: "Resume", description: "A focused one-page profile with clear hierarchy.", accent: "#3158C9" },
  { id: "t-proposal", name: "Project proposal", type: "document", category: "Business", description: "Frame scope, milestones, and an informed recommendation.", accent: "#B95622" },
  { id: "t-budget", name: "Monthly budget", type: "spreadsheet", category: "Finance", description: "Plan spending with a simple decision-ready view.", accent: "#16765C" },
  { id: "t-report", name: "Research report", type: "document", category: "Reports", description: "Make complex findings easy to navigate and act on.", accent: "#8063C4" },
  { id: "t-lesson", name: "Lesson plan", type: "document", category: "Education", description: "Structure objectives, activities, and reflection prompts.", accent: "#537495" },
  { id: "t-business", name: "Business narrative", type: "presentation", category: "Presentations", description: "Tell a persuasive story in ten uncluttered slides.", accent: "#B95622" },
  { id: "t-meeting", name: "Meeting notes", type: "document", category: "Planning", description: "Capture decisions, owners, and next actions clearly.", accent: "#3158C9" },
  { id: "t-invoice", name: "Clean invoice", type: "pdf", category: "Finance", description: "A client-ready bill with generous breathing room.", accent: "#B73B43" },
  ...presentationTemplateCatalog,
];

const storageKey = "officeflow.workspace.v1";
export const workspaceRepository = {
  load(): WorkspaceSnapshot {
    try { const stored = window.localStorage.getItem(storageKey); if (!stored) return initialSnapshot; const parsed = JSON.parse(stored) as WorkspaceSnapshot; const duplicateDrafts = (parsed.files || []).filter(file => file.source === "local" && file.name === "Untitled spreadsheet" && file.size === 0 && file.parentFolderId === null); const duplicateIds = duplicateDrafts.length > 1 ? new Set(duplicateDrafts.map(file => file.id)) : new Set<string>(); return { ...initialSnapshot, ...parsed, files: (parsed.files || initialSnapshot.files).filter(file => !duplicateIds.has(file.id)) }; }
    catch { return initialSnapshot; }
  },
  save(snapshot: WorkspaceSnapshot) { window.localStorage.setItem(storageKey, JSON.stringify(snapshot)); },
  reset() { window.localStorage.removeItem(storageKey); },
};

/** A future API adapter can replace these UI-safe service seams without changing consuming components. */
export const authService = {
  async signIn(_email: string, _password: string): Promise<never> { throw new Error("Authentication is not connected yet. Use the workspace preview to explore OfficeFlow."); },
  async register(_name: string, _email: string, _password: string): Promise<never> { throw new Error("Account creation is not connected yet. Use the workspace preview to explore OfficeFlow."); },
  async requestPasswordReset(_email: string): Promise<never> { throw new Error("Password reset is not connected yet. Contact the future workspace administrator for account access."); },
};

export const aiService = {
  async request(_prompt: string): Promise<{ status: "unavailable"; message: string }> {
    return { status: "unavailable", message: "AI is ready to connect, but no provider is configured for this workspace yet." };
  },
};

export const documentService = {
  async saveDocument(file: OfficeFile): Promise<{ status: "local"; updatedAt: string }> {
    return { status: "local", updatedAt: new Date().toISOString() };
  },
};

export function relativeDate(value: string) {
  const days = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 86400000));
  return days === 0 ? "Today" : days === 1 ? "Yesterday" : `${days} days ago`;
}

export function formatSize(bytes: number) { return bytes < 1_000_000 ? `${Math.max(1, Math.round(bytes / 1000))} KB` : `${(bytes / 1_000_000).toFixed(1)} MB`; }
