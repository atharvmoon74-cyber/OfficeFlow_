/** Quiet Ledger global Copilot host: listens for keyboard and contextual open events so every workspace and Studio uses the same honest AI interaction surface. */
import { useEffect, useState } from "react";
import { AICommandPanel } from "./AICommandPanel";
import type { AIContext } from "@/lib/aiProvider";

export function GlobalCopilot() { const [open, setOpen] = useState(false); const [context, setContext] = useState<AIContext | undefined>(); useEffect(() => { const onOpen = (event: Event) => { setContext((event as CustomEvent<AIContext>).detail); setOpen(true); }; const shortcut = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "j") { event.preventDefault(); setOpen(true); } }; window.addEventListener("officeflow:open-ai", onOpen); window.addEventListener("keydown", shortcut); return () => { window.removeEventListener("officeflow:open-ai", onOpen); window.removeEventListener("keydown", shortcut); }; }, []); return <AICommandPanel open={open} context={context} onClose={() => setOpen(false)} />; }
