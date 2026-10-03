/** Quiet Ledger studio route adapter: existing files launch their matching editors, while empty creation URLs create a real local draft once. */
import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import type { FileType } from "@/lib/officeflow";
import { DocumentStudio } from "./DocumentStudio";
import { SpreadsheetStudio } from "./SpreadsheetStudio";
import { PresentationStudio } from "./PresentationStudio";
import { PdfStudio } from "./PdfStudio";

export function DocumentStudioRoute() { return <StudioRoute type="document" render={(file, actions) => <DocumentStudio file={file} onRename={actions.rename} onTouch={actions.touch} />} />; }
export function SpreadsheetStudioRoute() { return <StudioRoute type="spreadsheet" render={(file, actions) => <SpreadsheetStudio file={file} onRename={actions.rename} onTouch={actions.touch} />} />; }
export function PresentationStudioRoute() { return <StudioRoute type="presentation" render={(file, actions) => <PresentationStudio file={file} onRename={actions.rename} onTouch={actions.touch} />} />; }
export function PdfStudioRoute() { return <StudioRoute type="pdf" render={(file, actions) => <PdfStudio file={file} onRename={actions.rename} onTouch={actions.touch} />} />; }
export function StudioRoute({ type, render }: { type: FileType; render: (file: ReturnType<typeof useWorkspace>["files"][number], actions: { rename: (name: string) => void; touch: () => void }) => React.ReactNode }) {
  const [, setLocation] = useLocation(); const { files, createDraft, updateFile } = useWorkspace(); const id = new URLSearchParams(window.location.search).get("file"); const file = files.find(item => item.id === id && item.type === type); const creating = useRef(false);
  useEffect(() => { if (!id && !creating.current) { creating.current = true; const draft = createDraft(type); setLocation(`/${type}/new?file=${draft.id}`, { replace: true }); } }, [id, type, createDraft, setLocation]);
  if (!id || !file) return <div className="of-studio-loading">Opening {type} studio…</div>;
  return <>{render(file, { rename: (name) => updateFile(file.id, { name }), touch: () => updateFile(file.id, {}) })}</>;
}
