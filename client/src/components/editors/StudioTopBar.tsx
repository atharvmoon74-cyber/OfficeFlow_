/** Quiet Ledger studio chrome: shared, functional file metadata, save-state, export, share, and AI affordances connect all editors. */
import { useRef, useState } from "react";
import { Check, ChevronDown, CloudOff, Download, History, MoreHorizontal, Moon, Redo2, Save, Share2, Sparkles, Sun, Undo2 } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import type { EditorSaveState } from "@/lib/editorModels";
import type { OfficeFile } from "@/lib/officeflow";
import { OfficeMark } from "@/components/officeflow/OfficeMark";
import { useTheme } from "@/contexts/ThemeContext";
import { openCopilot } from "@/lib/aiProvider";
import { openShareDialog } from "@/lib/sharing";

export function StudioTopBar({ file, saveState, onRename, onSave, onUndo, onRedo, onExportPdf, onExportNative, nativeLabel, onAskAI, children }: { file: OfficeFile; saveState: EditorSaveState; onRename: (name: string) => void; onSave: () => void; onUndo?: () => void; onRedo?: () => void; onExportPdf?: () => void; onExportNative?: () => void; nativeLabel?: string; onAskAI?: () => void; children?: React.ReactNode }) {
  const [renaming, setRenaming] = useState(false); const [menuOpen, setMenuOpen] = useState(false); const input = useRef<HTMLInputElement>(null);
  const { resolvedTheme, toggleTheme } = useTheme();
  const status = saveState === "saving" ? { label: "Saving…", icon: Save } : saveState === "saved" ? { label: "Saved locally", icon: Check } : saveState === "error" ? { label: "Unable to save", icon: CloudOff } : { label: "Unsaved changes", icon: Save };
  const StatusIcon = status.icon;
  const commitRename = () => { const next = input.current?.value.trim(); if (next && next !== file.name) onRename(next); setRenaming(false); };
  return <header className="of-studio-topbar"><div className="of-studio-file"><Link href="/files" className="of-studio-mark" aria-label="Back to OfficeFlow files"><OfficeMark className="h-8 w-8" /></Link><div className="of-studio-file-name">{renaming ? <input ref={input} autoFocus defaultValue={file.name} onBlur={commitRename} onKeyDown={event => { if (event.key === "Enter") commitRename(); if (event.key === "Escape") setRenaming(false); }} aria-label="Rename file" /> : <button onClick={() => setRenaming(true)} title="Rename file">{file.name}</button>}<span className={`is-${saveState}`}><StatusIcon size={13} />{status.label}</span></div></div><div className="of-studio-actions"><button onClick={onUndo} disabled={!onUndo} title="Undo (Ctrl/Cmd + Z)"><Undo2 size={17} /><span>Undo</span></button><button onClick={onRedo} disabled={!onRedo} title="Redo (Ctrl/Cmd + Shift + Z)"><Redo2 size={17} /><span>Redo</span></button><button onClick={onSave} className="of-studio-save" title="Save locally (Ctrl/Cmd + S)"><Save size={16} /><span>Save</span></button>{onAskAI && <button onClick={() => openCopilot({ fileId: file.id, fileName: file.name, fileType: file.type })} className="of-studio-ai"><Sparkles size={16} /><span>Ask AI</span></button>}<button onClick={() => openShareDialog({ fileId: file.id, fileName: file.name })} title="Share"><Share2 size={16} /><span>Share</span></button><div className="of-studio-export"><button onClick={() => setMenuOpen(value => !value)} title="Export"><Download size={16} /><span>Export</span><ChevronDown size={14} /></button>{menuOpen && <div className="of-studio-export-menu"><button onClick={() => { onExportPdf?.(); setMenuOpen(false); }}>Export PDF</button><button onClick={() => { onExportNative?.(); setMenuOpen(false); }}>Export {nativeLabel || "file"}</button></div>}</div><button onClick={toggleTheme} title={resolvedTheme === "dark" ? "Use light theme" : "Use dark theme"}>{resolvedTheme === "dark" ? <Sun size={17} /> : <Moon size={17} />}</button><button onClick={() => toast.info("More workspace actions will appear here as integrations are connected.")} title="More actions"><MoreHorizontal size={18} /></button>{children}</div></header>;
}
