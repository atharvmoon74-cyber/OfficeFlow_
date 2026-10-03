/** Quiet Ledger save manager: a debounced local-first persistence loop gives editors truthful saving, saved, and error states. */
import { useCallback, useEffect, useRef, useState } from "react";
import type { EditorSaveState } from "@/lib/editorModels";

export function useAutosave<T>(value: T, save: (value: T) => void, delay = 700) {
  const [state, setState] = useState<EditorSaveState>("unsaved"); const latest = useRef(value); const first = useRef(true); const stateRef = useRef<EditorSaveState>("unsaved");
  useEffect(() => { latest.current = value; if (first.current) { first.current = false; return; } setState("unsaved"); const timer = window.setTimeout(() => { try { setState("saving"); save(latest.current); setState("saved"); } catch { setState("error"); } }, delay); return () => window.clearTimeout(timer); }, [value, save, delay]);
  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { const warn = (event: BeforeUnloadEvent) => { if (stateRef.current === "unsaved" || stateRef.current === "saving") { event.preventDefault(); event.returnValue = ""; } }; window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn); }, []);
  const saveNow = useCallback(() => { try { setState("saving"); save(latest.current); setState("saved"); } catch { setState("error"); } }, [save]);
  return { saveState: state, saveNow };
}
