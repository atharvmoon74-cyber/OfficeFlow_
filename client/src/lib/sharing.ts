/** OfficeFlow sharing boundary: collaboration permissions require a backend provider; this event bridge supplies a truthful UI foundation without claiming remote access was granted. */
export type ShareContext = { fileId?: string; fileName?: string };
export const openShareDialog = (context?: ShareContext) => window.dispatchEvent(new CustomEvent("officeflow:open-share", { detail: context }));
