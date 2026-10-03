/** Quiet Ledger command surface: keyboard-first navigation stays fast, honest, and deliberately focused. */
import { useEffect, useMemo, useRef, useState } from "react";
import { Command, FilePlus2, FileSearch, Moon, Settings2, Sparkles, Sun, X } from "lucide-react";
import { useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { type FileType } from "@/lib/officeflow";
import { routeForFile } from "@/lib/fileTransfer";

type PaletteProps = { open: boolean; onClose: () => void; onAskAI: () => void };
export function CommandPalette({ open, onClose, onAskAI }: PaletteProps) {
  const [query, setQuery] = useState(""); const [active, setActive] = useState(0); const input = useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation(); const { createDraft, files, folders } = useWorkspace(); const { resolvedTheme, toggleTheme } = useTheme();
  useEffect(() => { if (open) { setQuery(""); setActive(0); requestAnimationFrame(() => input.current?.focus()); } }, [open]);
  const newFile = (type: FileType) => { const file = createDraft(type); setLocation(`/${type}/new?file=${file.id}`); onClose(); };
  const commands = useMemo(() => [
    { label: "New document", hint: "Create", icon: FilePlus2, execute: () => newFile("document") },
    { label: "New spreadsheet", hint: "Create", icon: FilePlus2, execute: () => newFile("spreadsheet") },
    { label: "New presentation", hint: "Create", icon: FilePlus2, execute: () => newFile("presentation") },
    { label: "New PDF", hint: "Create", icon: FilePlus2, execute: () => newFile("pdf") },
    { label: "Search files", hint: "Workspace", icon: FileSearch, execute: () => { setLocation("/files"); onClose(); } },
    { label: "Open recent files", hint: "Workspace", icon: FileSearch, execute: () => { setLocation("/recent"); onClose(); } },
    { label: "Open settings", hint: "Workspace", icon: Settings2, execute: () => { setLocation("/settings"); onClose(); } },
    { label: `Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`, hint: "Appearance", icon: resolvedTheme === "dark" ? Sun : Moon, execute: () => { toggleTheme(); onClose(); } },
    { label: "Ask AI", hint: "Intelligence", icon: Sparkles, execute: () => { onClose(); onAskAI(); } },
    ...files.filter(file => !file.trashed).map(file => ({ label: file.name, hint: `${file.type} file`, icon: FileSearch, execute: () => { setLocation(routeForFile(file.type, file.id)); onClose(); } })),
    ...folders.map(folder => ({ label: folder.name, hint: "Folder", icon: FileSearch, execute: () => { setLocation("/files"); onClose(); } })),
  ], [files, folders, resolvedTheme]);
  const visible = commands.filter(command => command.label.toLowerCase().includes(query.toLowerCase()));
  useEffect(() => setActive(0), [query]);
  useEffect(() => { const key = (event: KeyboardEvent) => { if (!open) return; if (event.key === "Escape") onClose(); if (event.key === "ArrowDown") { event.preventDefault(); setActive(value => Math.min(value + 1, Math.max(0, visible.length - 1))); } if (event.key === "ArrowUp") { event.preventDefault(); setActive(value => Math.max(value - 1, 0)); } if (event.key === "Enter") { event.preventDefault(); visible[active]?.execute(); } }; window.addEventListener("keydown", key); return () => window.removeEventListener("keydown", key); }, [open, active, visible]);
  if (!open) return null;
  return <div className="of-overlay" role="presentation" onMouseDown={onClose}><section className="of-command" role="dialog" aria-modal="true" aria-label="Command palette" onMouseDown={event => event.stopPropagation()}><div className="of-command-input"><Command size={18} /><input ref={input} value={query} onChange={event => setQuery(event.target.value)} placeholder="Search commands and files…" aria-label="Search commands" /><button onClick={onClose} aria-label="Close command palette"><X size={17} /></button></div><div className="of-command-list" role="listbox">{visible.length ? visible.map((command, index) => { const Icon = command.icon; return <button key={`${command.label}-${index}`} className={index === active ? "is-active" : ""} onMouseEnter={() => setActive(index)} onClick={command.execute}><span className="of-command-icon"><Icon size={17} /></span><span>{command.label}<small>{command.hint}</small></span>{index === active && <kbd>↵</kbd>}</button>; }) : <div className="of-command-empty">Nothing found. Try a file name or an action.</div>}</div><footer><span>Navigate <kbd>↑</kbd><kbd>↓</kbd></span><span>Run <kbd>↵</kbd></span><span>Close <kbd>esc</kbd></span></footer></section></div>;
}
