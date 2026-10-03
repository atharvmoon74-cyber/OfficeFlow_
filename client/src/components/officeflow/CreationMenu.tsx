/** Quiet Ledger creation menu: every visible action creates a local draft or imports a real browser-selected file. */
import { useRef } from "react";
import { FilePlus2, FileSpreadsheet, FileText, FolderPlus, Presentation, Upload, type LucideIcon } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { type FileType } from "@/lib/officeflow";
import { routeForFile } from "@/lib/fileTransfer";
import { FileVisual } from "./FileVisual";

type CreationMenuProps = { open: boolean; onClose: () => void };
const blankItems: { type: FileType; title: string; detail: string; icon: LucideIcon }[] = [
  { type: "document", title: "Blank document", detail: "Start writing with a clean page", icon: FileText },
  { type: "spreadsheet", title: "Blank spreadsheet", detail: "Calculate and organize data", icon: FileSpreadsheet },
  { type: "presentation", title: "Blank presentation", detail: "Build a focused narrative", icon: Presentation },
  { type: "pdf", title: "Blank PDF", detail: "Create a simple PDF workspace", icon: FilePlus2 },
];
export function CreationMenu({ open, onClose }: CreationMenuProps) {
  const input = useRef<HTMLInputElement>(null); const [, setLocation] = useLocation(); const { createDraft, createFolder, importLocalFile } = useWorkspace();
  const create = (type: FileType, name?: string) => { const file = createDraft(type, name); setLocation(`/${type}/new?file=${file.id}`); onClose(); };
  const importFile = async (event: React.ChangeEvent<HTMLInputElement>) => { const selected = Array.from(event.target.files || []); if (!selected.length) return; const imported = []; for (const file of selected) { try { imported.push(await importLocalFile(file)); } catch (error) { toast.error(error instanceof Error ? `${file.name}: ${error.message}` : `${file.name}: unable to import`); } } event.target.value = ""; if (!imported.length) return; toast.success(`${imported.length} file${imported.length === 1 ? "" : "s"} added to this browser workspace`); onClose(); setLocation(imported.length === 1 ? routeForFile(imported[0].type, imported[0].id) : "/files"); };
  const createFolderAction = () => { const name = window.prompt("Name this folder"); if (!name?.trim()) return; createFolder(name.trim()); toast.success("Folder created"); onClose(); setLocation("/files"); };
  if (!open) return null;
  return <div className="of-overlay of-new-overlay" role="presentation" onMouseDown={onClose}><section className="of-new-menu" role="dialog" aria-modal="true" aria-labelledby="create-title" onMouseDown={event => event.stopPropagation()}><header><div><span className="of-index">CREATE</span><h2 id="create-title">Start with intent</h2><p>Every new file stays in this browser until a cloud workspace is connected.</p></div><button className="of-close" onClick={onClose} aria-label="Close creation menu">×</button></header><div className="of-new-section"><p className="of-section-label">BLANK</p><div className="of-new-grid">{blankItems.map(item => <button key={item.type} onClick={() => create(item.type)}><FileVisual type={item.type} size="md" /><span><strong>{item.title}</strong><small>{item.detail}</small></span></button>)}</div></div><div className="of-new-section of-template-strip"><p className="of-section-label">FROM A TEMPLATE</p><div>{["Resume", "Report", "Invoice", "Project proposal", "Meeting notes", "Budget"].map((name, index) => <button key={name} onClick={() => create(index === 2 ? "pdf" : index === 5 ? "spreadsheet" : "document", name)}>{name}</button>)}</div></div><footer><input ref={input} className="sr-only" type="file" multiple accept=".doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.pdf,.csv,image/*" onChange={importFile} /><button onClick={createFolderAction}><FolderPlus size={17} /> New folder</button><button className="of-import" onClick={() => input.current?.click()}><Upload size={17} /> Import files</button></footer></section></div>;
}
