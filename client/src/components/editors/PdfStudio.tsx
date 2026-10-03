/** Quiet Ledger PDF Studio: real local page manipulation, preview, search, and annotation workflows built on browser-safe PDF service boundaries. */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDownToLine, ChevronLeft, ChevronRight, Circle, Copy, Download, Highlighter, Merge, Minus, MoreHorizontal, MousePointer2, Pencil, Plus, Printer, RectangleHorizontal, RotateCw, Scissors, Search, Strikethrough, TextCursorInput, Trash2, Underline, X } from "lucide-react";
import { toast } from "sonner";
import type { OfficeFile } from "@/lib/officeflow";
import { freshId } from "@/lib/officeflow";
import { loadBinary, storeBinary } from "@/lib/binaryStorage";
import { emptyPdfProject, type PdfAnnotation, type PdfAnnotationKind, type PdfProject } from "@/lib/pdfModels";
import { applyAnnotations, createBlankPdf, downloadBlob, inspectPdf, pdfOperations } from "@/lib/pdfService";
import { editorRepository } from "@/lib/editorStorage";
import { useAutosave } from "@/hooks/useAutosave";
import { StudioTopBar } from "./StudioTopBar";

const annotationTools: { id: PdfAnnotationKind; label: string; icon: React.ReactNode; color: string }[] = [
  { id: "highlight", label: "Highlight", icon: <Highlighter size={16} />, color: "#e4b83f" },
  { id: "underline", label: "Underline", icon: <Underline size={16} />, color: "#3158c9" },
  { id: "strikeout", label: "Strikeout", icon: <Strikethrough size={16} />, color: "#b73b43" },
  { id: "draw", label: "Draw", icon: <Pencil size={16} />, color: "#3158c9" },
  { id: "text", label: "Text note", icon: <TextCursorInput size={16} />, color: "#3158c9" },
  { id: "rectangle", label: "Rectangle", icon: <RectangleHorizontal size={16} />, color: "#3158c9" },
  { id: "circle", label: "Circle", icon: <Circle size={16} />, color: "#3158c9" },
  { id: "arrow", label: "Arrow", icon: <ChevronRight size={16} />, color: "#3158c9" },
];
const annotationSize: Record<PdfAnnotationKind, [number, number]> = { highlight: [34, 4], underline: [30, 1], strikeout: [30, 1], draw: [18, 8], text: [18, 8], rectangle: [20, 12], circle: [13, 13], arrow: [22, 8] };

export function PdfStudio({ file, onRename, onTouch }: { file: OfficeFile; onRename: (name: string) => void; onTouch: () => void }) {
  const [project, setProject] = useState<PdfProject>(() => editorRepository.load<PdfProject>(file.id) || emptyPdfProject(file.name));
  const [blob, setBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState("");
  const [query, setQuery] = useState("");
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [tool, setTool] = useState<PdfAnnotationKind | "select">("select");
  const mergeInput = useRef<HTMLInputElement>(null);
  const save = useCallback((next: PdfProject) => { editorRepository.save(file.id, next); onTouch(); }, [file.id, onTouch]);
  const { saveState, saveNow } = useAutosave(project, save, 600);

  const initialize = useCallback(async () => {
    try {
      setLoading(true);
      let source = await loadBinary(file.id);
      if (!source) { source = await createBlankPdf(); await storeBinary(file.id, source); }
      const inspected = await inspectPdf(source).catch(() => ({ pageCount: 1, textByPage: [""] }));
      setBlob(source);
      setProject(current => ({ ...current, title: file.name, pageCount: inspected.pageCount, textByPage: inspected.textByPage, activePage: Math.min(current.activePage, Math.max(0, inspected.pageCount - 1)) }));
    } catch { toast.error("Unable to open this PDF. Try importing it again."); }
    finally { setLoading(false); }
  }, [file.id, file.name]);
  useEffect(() => { initialize(); }, [initialize]);
  useEffect(() => { if (!blob) return; const url = URL.createObjectURL(blob); setPreviewUrl(url); return () => URL.revokeObjectURL(url); }, [blob]);

  const commitBlob = async (next: Blob, label: string) => {
    try {
      setProcessing(label);
      await storeBinary(file.id, next);
      const inspected = await inspectPdf(next).catch(() => ({ pageCount: project.pageCount, textByPage: project.textByPage }));
      setBlob(next);
      setProject(current => ({ ...current, pageCount: inspected.pageCount, textByPage: inspected.textByPage, activePage: Math.min(current.activePage, Math.max(0, inspected.pageCount - 1)) }));
      toast.success(label.replace("…", " complete"));
    } catch (error) { toast.error(error instanceof Error ? error.message : "Something went wrong. Try again."); }
    finally { setProcessing(""); }
  };
  const operation = async (label: string, action: (current: Blob) => Promise<Blob>) => { if (blob) await commitBlob(await action(blob), label); };
  const activeAnnotations = project.annotations.filter(annotation => annotation.page === project.activePage);
  const matches = useMemo(() => {
    if (!query.trim()) return [];
    return project.textByPage.flatMap((text, page) => {
      const found = text.toLowerCase().indexOf(query.toLowerCase());
      return found >= 0 ? [{ page, snippet: text.slice(Math.max(0, found - 36), found + query.length + 64) || "Text match" }] : [];
    });
  }, [query, project.textByPage]);

  const addAnnotation = (event: React.MouseEvent<HTMLDivElement>) => {
    if (tool === "select") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const [width, height] = annotationSize[tool];
    const meta = annotationTools.find(item => item.id === tool)!;
    const text = tool === "text" ? window.prompt("Annotation text", "Note") || "Note" : undefined;
    const annotation: PdfAnnotation = {
      id: freshId("annotation"), page: project.activePage, kind: tool, width, height, color: meta.color, text,
      x: Math.max(0, Math.min(100 - width, ((event.clientX - bounds.left) / bounds.width) * 100)),
      y: Math.max(0, Math.min(100 - height, ((event.clientY - bounds.top) / bounds.height) * 100)),
    };
    setProject(current => ({ ...current, annotations: [...current.annotations, annotation] }));
    setSelectedAnnotation(annotation.id);
  };
  const exportAnnotated = async () => {
    if (!blob) return;
    try {
      setProcessing("Preparing annotated PDF…");
      const scaled = project.annotations.map(item => ({ ...item, x: item.x * 6.12, y: item.y * 7.92, width: item.width * 6.12, height: item.height * 7.92 }));
      downloadBlob(await applyAnnotations(blob, scaled), file.name);
      toast.success("Annotated PDF prepared for download");
    } catch { toast.error("Unable to prepare annotations for download."); }
    finally { setProcessing(""); }
  };
  const mergePdf = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const extra = event.target.files?.[0];
    if (extra && blob) await operation("Merging PDF…", current => pdfOperations.merge([current, extra]));
    event.target.value = "";
  };
  const reorder = async (direction: -1 | 1) => {
    const target = project.activePage + direction;
    if (target < 0 || target >= project.pageCount) return;
    const order = Array.from({ length: project.pageCount }, (_, index) => index);
    [order[project.activePage], order[target]] = [order[target], order[project.activePage]];
    await operation("Reordering pages…", current => pdfOperations.reorder(current, order));
    setProject(current => ({ ...current, activePage: target }));
  };
  const extractCurrent = async () => {
    if (!blob) return;
    try { setProcessing("Extracting page…"); downloadBlob(await pdfOperations.extract(blob, [project.activePage]), `${file.name.replace(/\.pdf$/i, "")}-page-${project.activePage + 1}.pdf`); toast.success("Extracted page downloaded"); }
    catch { toast.error("Unable to extract this page."); }
    finally { setProcessing(""); }
  };
  const printPdf = () => { if (!previewUrl) return; const popup = window.open(previewUrl, "_blank"); if (!popup) toast.info("Allow pop-ups to print from the browser PDF viewer."); else popup.addEventListener("load", () => popup.print()); };
  if (loading) return <div className="of-studio-loading">Opening PDF Studio…</div>;

  return <div className="of-studio of-pdf-studio">
    <StudioTopBar file={file} saveState={saveState} onRename={onRename} onSave={saveNow} onExportPdf={exportAnnotated} onExportNative={exportAnnotated} nativeLabel="PDF" onAskAI={() => toast.info("AI is ready to connect. No provider is configured for this workspace yet.")}>
      <button className="of-studio-panel-button" onClick={printPdf} title="Print PDF"><Printer size={17} /></button>
    </StudioTopBar>
    <div className="of-pdf-toolbar">
      <div>{<button title="Select annotations" className={tool === "select" ? "is-active" : ""} onClick={() => setTool("select")}><MousePointer2 size={16} /></button>}{annotationTools.map(item => <button key={item.id} title={item.label} className={tool === item.id ? "is-active" : ""} onClick={() => setTool(item.id)}>{item.icon}</button>)}</div>
      <div><button title="Add blank page" onClick={() => operation("Adding page…", pdfOperations.addPage)}><Plus size={16} /></button><button title="Duplicate current page" onClick={() => operation("Duplicating page…", current => pdfOperations.duplicatePage(current, project.activePage))}><Copy size={16} /></button><button title="Delete current page" onClick={() => operation("Deleting page…", current => pdfOperations.deletePage(current, project.activePage))}><Trash2 size={16} /></button><button title="Rotate current page" onClick={() => operation("Rotating page…", current => pdfOperations.rotate(current, project.activePage))}><RotateCw size={16} /></button><button title="Extract current page" onClick={extractCurrent}><Scissors size={16} /></button><button title="Merge another PDF" onClick={() => mergeInput.current?.click()}><Merge size={16} /></button></div>
      <div className="of-pdf-zoom"><button title="Zoom out" onClick={() => setProject(current => ({ ...current, zoom: Math.max(.55, Number((current.zoom - .15).toFixed(2))) }))}><Minus size={16} /></button><span>{Math.round(project.zoom * 100)}%</span><button title="Zoom in" onClick={() => setProject(current => ({ ...current, zoom: Math.min(1.8, Number((current.zoom + .15).toFixed(2))) }))}><Plus size={16} /></button></div>
      <input ref={mergeInput} className="sr-only" type="file" accept="application/pdf,.pdf" onChange={mergePdf} />
    </div>
    <div className="of-pdf-workbench">
      <aside className="of-pdf-thumbnails"><header><span className="of-index">PAGES</span><span>{project.pageCount}</span></header><div>{Array.from({ length: project.pageCount }, (_, page) => <button key={page} className={page === project.activePage ? "is-active" : ""} onClick={() => { setProject(current => ({ ...current, activePage: page })); setSelectedAnnotation(null); }}><span>{page + 1}</span><i style={{ transform: `rotate(${project.rotations[page] || 0}deg)` }}><b>{project.textByPage[page]?.slice(0, 44) || "Blank page"}</b><em /></i></button>)}</div><footer><button title="Move page up" disabled={project.activePage === 0} onClick={() => reorder(-1)}><ChevronLeft size={16} /></button><button title="Move page down" disabled={project.activePage === project.pageCount - 1} onClick={() => reorder(1)}><ChevronRight size={16} /></button></footer></aside>
      <main className="of-pdf-stage"><div className={tool === "select" ? "of-pdf-page" : "of-pdf-page is-annotating"} style={{ transform: `scale(${project.zoom})`, transformOrigin: "top center" }}><iframe src={`${previewUrl}#page=${project.activePage + 1}&zoom=page-width`} title="PDF preview" /><div className="of-pdf-annotation-layer" onClick={addAnnotation}>{activeAnnotations.map(annotation => <button key={annotation.id} title={annotation.text || annotation.kind} className={`of-pdf-annotation is-${annotation.kind} ${selectedAnnotation === annotation.id ? "is-selected" : ""}`} style={{ left: `${annotation.x}%`, top: `${annotation.y}%`, width: `${annotation.width}%`, height: `${annotation.height}%`, borderColor: annotation.color, background: annotation.kind === "highlight" ? `${annotation.color}66` : undefined, color: annotation.color }} onClick={event => { event.stopPropagation(); setSelectedAnnotation(annotation.id); }}><span>{annotation.kind === "text" ? annotation.text : ""}</span></button>)}</div></div><footer><span>Page {project.activePage + 1} of {project.pageCount}</span><span>{processing || (tool === "select" ? "Select an annotation or choose a tool" : `Click the page to add ${tool}`)}</span>{selectedAnnotation && <button onClick={() => { setProject(current => ({ ...current, annotations: current.annotations.filter(annotation => annotation.id !== selectedAnnotation) })); setSelectedAnnotation(null); }}><Trash2 size={14} /> Delete annotation</button>}</footer></main>
      <aside className="of-pdf-search"><div><span className="of-index">PDF INTELLIGENCE</span><h2>Find in PDF</h2></div><label><Search size={16} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search PDF text" /></label><p>{query ? `${matches.length} match${matches.length === 1 ? "" : "es"} found` : "Text search is available for imported text-based PDFs."}</p><div className="of-pdf-matches">{matches.length ? matches.map(match => <button key={match.page} onClick={() => setProject(current => ({ ...current, activePage: match.page }))}><span>Page {match.page + 1}</span><b>{match.snippet}</b></button>) : query && <div className="of-panel-empty">No text matches. Image-only PDFs need OCR processing, which is not configured in this browser workspace.</div>}</div><div className="of-pdf-actions"><button onClick={() => blob && downloadBlob(blob, file.name)}><Download size={15} /> Download original</button><button onClick={exportAnnotated}><ArrowDownToLine size={15} /> Export annotations</button><button onClick={() => toast.info("More PDF conversion actions require the processing service to be configured.")}><MoreHorizontal size={15} /> More actions</button></div></aside>
    </div>
  </div>;
}
