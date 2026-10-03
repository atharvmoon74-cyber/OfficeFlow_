/** Quiet Ledger workspace state: local-first file interactions with backend-ready models and no false cloud claims. */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { freshId, initialSnapshot, type FileType, type FileView, type OfficeFile, type OfficeFolder, type OfficeUser, workspaceRepository } from "@/lib/officeflow";
import { storeBinary } from "@/lib/binaryStorage";
import { validateImport } from "@/lib/fileTransfer";
import { useAuth } from "@/contexts/AuthContext";

type WorkspaceContextValue = {
  files: OfficeFile[]; folders: OfficeFolder[]; user: OfficeUser; viewMode: FileView; selectedIds: string[];
  setViewMode: (view: FileView) => void; setSelectedIds: (ids: string[]) => void; updateUser: (patch: Partial<OfficeUser>) => void;
  createDraft: (type: FileType, name?: string) => OfficeFile; importLocalFile: (file: File) => Promise<OfficeFile>; createFolder: (name: string, parentFolderId?: string | null) => void;
  updateFile: (id: string, patch: Partial<OfficeFile>) => void; deleteFiles: (ids: string[], permanent?: boolean) => void; restoreFiles: (ids: string[]) => void; moveFiles: (ids: string[], parentFolderId: string | null) => void;
  deleteFolder: (id: string) => void; renameFolder: (id: string, name: string) => void; resetWorkspace: () => void;
};
const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [snapshot, setSnapshot] = useState(() => workspaceRepository.load());
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { user: authenticatedUser } = useAuth();
  useEffect(() => { workspaceRepository.save(snapshot); }, [snapshot]);
  useEffect(() => { if (authenticatedUser) setSnapshot(current => current.user.id === authenticatedUser.id && current.user.name === authenticatedUser.name && current.user.email === authenticatedUser.email ? current : { ...current, user: { ...current.user, id: authenticatedUser.id, name: authenticatedUser.name, email: authenticatedUser.email } }); }, [authenticatedUser]);
  const update = (fn: (current: typeof snapshot) => typeof snapshot) => setSnapshot(fn);
  const value = useMemo<WorkspaceContextValue>(() => ({
    ...snapshot, selectedIds, setSelectedIds,
    setViewMode: (viewMode) => update(current => ({ ...current, viewMode })),
    updateUser: (patch) => update(current => ({ ...current, user: { ...current.user, ...patch } })),
    createDraft: (type, suppliedName) => {
      const item: OfficeFile = { id: freshId("file"), name: suppliedName || `Untitled ${type}`, type, ownerId: snapshot.user.id, parentFolderId: null, size: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), starred: false, trashed: false, source: "local" };
      update(current => ({ ...current, files: [item, ...current.files] })); return item;
    },
    importLocalFile: async (file) => {
      const validation = await validateImport(file); if (validation.error) throw new Error(validation.error);
      const item: OfficeFile = { id: freshId("import"), name: file.name, type: validation.type, ownerId: snapshot.user.id, parentFolderId: null, size: file.size, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), starred: false, trashed: false, source: "local" };
      await storeBinary(item.id, file); update(current => ({ ...current, files: [item, ...current.files] })); return item;
    },
    createFolder: (name, parentFolderId = null) => update(current => ({ ...current, folders: [{ id: freshId("folder"), name, ownerId: current.user.id, parentFolderId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...current.folders] })),
    updateFile: (id, patch) => update(current => ({ ...current, files: current.files.map(file => file.id === id ? { ...file, ...patch, updatedAt: new Date().toISOString() } : file) })),
    deleteFiles: (ids, permanent = false) => { update(current => ({ ...current, files: permanent ? current.files.filter(file => !ids.includes(file.id)) : current.files.map(file => ids.includes(file.id) ? { ...file, trashed: true, starred: false } : file) })); setSelectedIds([]); },
    restoreFiles: (ids) => { update(current => ({ ...current, files: current.files.map(file => ids.includes(file.id) ? { ...file, trashed: false, updatedAt: new Date().toISOString() } : file) })); setSelectedIds([]); },
    moveFiles: (ids, parentFolderId) => { update(current => ({ ...current, files: current.files.map(file => ids.includes(file.id) ? { ...file, parentFolderId, updatedAt: new Date().toISOString() } : file) })); setSelectedIds([]); },
    deleteFolder: (id) => update(current => ({ ...current, folders: current.folders.filter(folder => folder.id !== id), files: current.files.map(file => file.parentFolderId === id ? { ...file, parentFolderId: null } : file) })),
    renameFolder: (id, name) => update(current => ({ ...current, folders: current.folders.map(folder => folder.id === id ? { ...folder, name, updatedAt: new Date().toISOString() } : folder) })),
    resetWorkspace: () => { workspaceRepository.reset(); setSnapshot(initialSnapshot); setSelectedIds([]); },
  }), [snapshot, selectedIds]);
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() { const context = useContext(WorkspaceContext); if (!context) throw new Error("useWorkspace must be used inside WorkspaceProvider"); return context; }
