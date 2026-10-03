/** Regression coverage for OfficeFlow’s editable presentation-template factory. */
import { describe, expect, it } from "vitest";
import { createPresentationFromTemplate, presentationTemplateCatalog } from "./presentationTemplates";

describe("OfficeFlow presentation templates", () => {
  it("offers a substantial set of editable presentation concepts", () => { expect(presentationTemplateCatalog.length).toBeGreaterThanOrEqual(30); expect(presentationTemplateCatalog.every(template => template.type === "presentation")).toBe(true); });
  it("creates a structured seven-slide deck rather than a static preview", () => { const deck = createPresentationFromTemplate("p-investor-pitch") || createPresentationFromTemplate("p-pitch-deck"); expect(deck).not.toBeNull(); expect(deck?.slides).toHaveLength(7); expect(deck?.slides.map(slide => slide.layout)).toEqual(["title", "section", "content", "two-column", "number", "quote", "title"]); expect(deck?.slides.every(slide => slide.elements.length > 0)).toBe(true); expect(["wide", "standard", "portrait"]).toContain(deck?.format); });
});
