/** Quiet Ledger editor persistence: reliable browser storage that can be replaced by a future cloud adapter without changing studios. */
const key = "officeflow.editor-projects.v1";
type Store = Record<string, unknown>;
const read = (): Store => { try { return JSON.parse(window.localStorage.getItem(key) || "{}"); } catch { return {}; } };
export const editorRepository = {
  load<T>(fileId: string): T | null { return (read()[fileId] as T | undefined) || null; },
  save<T>(fileId: string, project: T) { const store = read(); store[fileId] = project; window.localStorage.setItem(key, JSON.stringify(store)); return new Date().toISOString(); },
  remove(fileId: string) { const store = read(); delete store[fileId]; window.localStorage.setItem(key, JSON.stringify(store)); },
};
