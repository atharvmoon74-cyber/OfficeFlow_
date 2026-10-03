/** Quiet Ledger binary persistence: IndexedDB stores selected local files without putting large blobs into workspace metadata or localStorage. */
const databaseName = "officeflow-binaries-v1";
const storeName = "files";

function database(): Promise<IDBDatabase> { return new Promise((resolve, reject) => { const request = indexedDB.open(databaseName, 1); request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(storeName)) request.result.createObjectStore(storeName); }; request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); }); }
export async function storeBinary(id: string, blob: Blob) { const db = await database(); return new Promise<void>((resolve, reject) => { const request = db.transaction(storeName, "readwrite").objectStore(storeName).put(blob, id); request.onsuccess = () => resolve(); request.onerror = () => reject(request.error); }); }
export async function loadBinary(id: string) { const db = await database(); return new Promise<Blob | null>((resolve, reject) => { const request = db.transaction(storeName, "readonly").objectStore(storeName).get(id); request.onsuccess = () => resolve((request.result as Blob | undefined) || null); request.onerror = () => reject(request.error); }); }
export async function deleteBinary(id: string) { const db = await database(); return new Promise<void>((resolve, reject) => { const request = db.transaction(storeName, "readwrite").objectStore(storeName).delete(id); request.onsuccess = () => resolve(); request.onerror = () => reject(request.error); }); }
