/** Quiet Ledger AI boundary: all Copilot operations route through a provider interface; the static client never exposes or invents credentials or model responses. */
export type AIContext = { fileId?: string; fileName?: string; fileType?: string; selection?: string };
export type AIMessage = { id: string; role: "user" | "assistant" | "system"; content: string; createdAt: string };
export type PresentationOutline = { title: string; slides: { title: string; body: string[]; notes?: string }[]; theme?: string };
export interface AIProvider { status(): { configured: boolean; message: string }; generateText(prompt: string, context?: AIContext, signal?: AbortSignal): Promise<string>; analyzeDocument(text: string, signal?: AbortSignal): Promise<string>; analyzeSpreadsheet(data: string, signal?: AbortSignal): Promise<string>; generateFormula(prompt: string, signal?: AbortSignal): Promise<string>; generatePresentation(prompt: string, signal?: AbortSignal): Promise<PresentationOutline>; }
class ProviderUnavailableError extends Error { constructor() { super("AI provider not configured. Connect a server-side provider adapter before sending workspace content to AI."); this.name = "ProviderUnavailableError"; } }
const unavailable = () => { throw new ProviderUnavailableError(); };
export const aiProvider: AIProvider = { status: () => ({ configured: false, message: "AI provider not configured. Connect a server-side provider adapter to enable OfficeFlow AI." }), generateText: unavailable, analyzeDocument: unavailable, analyzeSpreadsheet: unavailable, generateFormula: unavailable, generatePresentation: unavailable };
export const openCopilot = (context?: AIContext) => window.dispatchEvent(new CustomEvent("officeflow:open-ai", { detail: context }));
export const aiSuggestions = ["Write a report", "Create a presentation", "Analyze this spreadsheet", "Summarize this document", "Improve my writing", "Create a budget", "Explain this formula", "Turn this document into slides"];
