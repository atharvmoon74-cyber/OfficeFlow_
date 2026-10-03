/** Quiet Ledger presentation template factory: varied editorial concepts become editable seven-slide decks, not static preview images. */
import type { OfficeTemplate } from "./officeflow";
import { presentationThemes, type PresentationProject, type Slide, type SlideFormat, type SlideTheme } from "./editorModels";

type Spec = { id: string; name: string; category: string; description: string; accent: string; theme: SlideTheme; format?: SlideFormat; subject: string; }; 
const specs: Spec[] = [
  { id: "p-business-proposal", name: "Business proposal", category: "Business", description: "A decision-ready proposal with clear investment logic.", accent: "#3158C9", theme: "executive", subject: "The proposal" },
  { id: "p-company-profile", name: "Company profile", category: "Corporate", description: "A confident introduction to the company and its direction.", accent: "#3158C9", theme: "minimal", subject: "Our company" },
  { id: "p-annual-report", name: "Annual report", category: "Annual report", description: "A composed review of performance, priorities, and progress.", accent: "#16765C", theme: "executive", subject: "The year in review" },
  { id: "p-sales-report", name: "Sales report", category: "Business", description: "Turn commercial performance into a focused leadership story.", accent: "#16765C", theme: "modern", subject: "Sales momentum" },
  { id: "p-marketing-strategy", name: "Marketing strategy", category: "Marketing strategy", description: "Audience, message, channels, and measurable next steps.", accent: "#B95622", theme: "creative", subject: "The marketing plan" },
  { id: "p-project-status", name: "Project status", category: "Project status", description: "A crisp program update for stakeholders and teams.", accent: "#3158C9", theme: "minimal", subject: "Project status" },
  { id: "p-case-study", name: "Case study", category: "Business", description: "Frame a challenge, intervention, and meaningful outcome.", accent: "#9B5636", theme: "academic", subject: "The case" },
  { id: "p-pitch-deck", name: "Investor pitch", category: "Pitch deck", description: "A paced story for an ambitious early-stage company.", accent: "#ED6A3A", theme: "startup", subject: "The opportunity" },
  { id: "p-product-launch", name: "Product launch", category: "Product launch", description: "Launch narrative, audience promise, and roll-out plan.", accent: "#ED6A3A", theme: "startup", subject: "The launch" },
  { id: "p-market-analysis", name: "Market analysis", category: "Market analysis", description: "An analytical view of landscape, signals, and position.", accent: "#2382BD", theme: "scientific", subject: "The market" },
  { id: "p-school", name: "School presentation", category: "Education", description: "A friendly lesson structure that keeps the key ideas clear.", accent: "#3158C9", theme: "minimal", subject: "Today’s topic" },
  { id: "p-college", name: "College seminar", category: "Education", description: "A clean academic deck for discussion and learning.", accent: "#9B5636", theme: "academic", subject: "Seminar findings" },
  { id: "p-research", name: "Research presentation", category: "Research presentation", description: "Evidence, method, analysis, and a precise conclusion.", accent: "#2382BD", theme: "scientific", subject: "Research findings" },
  { id: "p-lab", name: "Lab presentation", category: "Science & Technology", description: "An experiment-focused narrative for results and interpretation.", accent: "#2382BD", theme: "scientific", subject: "Laboratory results" },
  { id: "p-thesis", name: "Thesis defense", category: "Education", description: "A rigorous structure for framing, defending, and closing research.", accent: "#9B5636", theme: "academic", subject: "Thesis defense" },
  { id: "p-computer-science", name: "Computer science", category: "Science & Technology", description: "Systems, evidence, and implementation details in balance.", accent: "#2382BD", theme: "dark", subject: "Computing systems" },
  { id: "p-space", name: "Space & astronomy", category: "Science & Technology", description: "A cinematic scientific story of scale, motion, and discovery.", accent: "#5B8CFF", theme: "dark", subject: "The cosmos" },
  { id: "p-data-science", name: "Data science", category: "Science & Technology", description: "From data question to model result and recommendation.", accent: "#2382BD", theme: "scientific", subject: "Data intelligence" },
  { id: "p-ai-ml", name: "AI & machine learning", category: "Science & Technology", description: "A modern technical deck for model, impact, and safeguards.", accent: "#7252C5", theme: "creative", subject: "Machine intelligence" },
  { id: "p-portfolio", name: "Portfolio", category: "Personal", description: "Show selected work with a calm, editorial visual rhythm.", accent: "#AD7941", theme: "elegant", subject: "Selected work" },
  { id: "p-travel", name: "Travel story", category: "Personal", description: "A photo-led narrative for places, moments, and memories.", accent: "#16765C", theme: "modern", subject: "The journey" },
  { id: "p-personal-profile", name: "Personal profile", category: "Personal", description: "An approachable professional introduction with character.", accent: "#AD7941", theme: "elegant", subject: "A little about me" },
  { id: "p-minimal", name: "Minimal editorial", category: "Creative", description: "Spacious typographic storytelling for a single strong idea.", accent: "#3158C9", theme: "minimal", subject: "The essential idea" },
  { id: "p-magazine", name: "Magazine feature", category: "Creative", description: "A refined feature narrative with quote-led pacing.", accent: "#AD7941", theme: "elegant", subject: "The feature" },
  { id: "p-cinematic", name: "Cinematic narrative", category: "Creative", description: "High-contrast pacing for a memorable visual story.", accent: "#5B8CFF", theme: "dark", subject: "The story" },
  { id: "p-dark", name: "Dark modern", category: "Creative", description: "A sharp, dark presentation system for focused impact.", accent: "#5B8CFF", theme: "dark", subject: "The signal" },
  { id: "p-modern", name: "Modern strategy", category: "Creative", description: "A calm contemporary deck for clear strategic decisions.", accent: "#16765C", theme: "modern", subject: "The strategy" },
  { id: "p-elegant", name: "Elegant keynote", category: "Creative", description: "Warm, considered storytelling with a premium tone.", accent: "#AD7941", theme: "elegant", subject: "The keynote" },
  { id: "p-engineering", name: "Engineering review", category: "Science & Technology", description: "A structured technical review from constraints to choices.", accent: "#2382BD", theme: "scientific", subject: "Engineering review" },
  { id: "p-startup-strategy", name: "Startup strategy", category: "Startup", description: "A practical deck for positioning, traction, and focus.", accent: "#ED6A3A", theme: "startup", subject: "The next chapter" },
];

export const presentationTemplateCatalog: OfficeTemplate[] = specs.map(({ id, name, category, description, accent }) => ({ id, name, category, description, accent, type: "presentation" }));
const newId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;
function slide(name: string, layout: Slide["layout"], elements: Slide["elements"]): Slide { return { id: newId("slide"), name, layout, elements }; }
export function createPresentationFromTemplate(templateId: string): PresentationProject | null {
  const spec = specs.find(item => item.id === templateId); if (!spec) return null; const theme = presentationThemes[spec.theme]; const accentPale = `${theme.accent}24`;
  const title = (text: string, y = 65, size = 38) => ({ id: newId("text"), type: "text" as const, x: 72, y, width: 730, height: 74, text, color: theme.foreground, fontSize: size, bold: true, fontFamily: "Manrope" as const });
  const body = (text: string, x = 76, y = 170, width = 500, size = 20) => ({ id: newId("text"), type: "text" as const, x, y, width, height: 200, text, color: theme.muted, fontSize: size, lineHeight: 1.38 });
  const bar = (x = 76, y = 325, width = 170) => ({ id: newId("shape"), type: "shape" as const, x, y, width, height: 7, fill: theme.accent, shape: "round" as const, radius: 8 });
  const slides: Slide[] = [
    slide("Cover", "title", [title(spec.name, 106, 49), body(`${spec.description}\n\nOfficeFlow presentation template`, 78, 251, 550, 19), bar(78, 355, 200), { id: newId("shape"), type: "shape", x: 725, y: 95, width: 125, height: 310, fill: accentPale, shape: "round", radius: 40 }]),
    slide("Section", "section", [title(spec.subject, 175, 48), body("Context · evidence · next actions", 78, 290, 430, 20), bar(78, 348, 150)]),
    slide("The context", "content", [title("The context"), body("Frame the decision with the evidence the audience needs most. Keep each point concise and purposeful."), { id: newId("shape"), type: "shape", x: 660, y: 160, width: 170, height: 220, fill: accentPale, shape: "round", radius: 24 }, { id: newId("text"), type: "text", x: 690, y: 220, width: 110, height: 80, text: "01\nFOCUS", color: theme.accent, fontSize: 25, bold: true, align: "center" }]),
    slide("Comparison", "two-column", [title("Two paths, one clear choice"), body("Option A\n\nMeasured progress\nLower commitment\nUseful signal", 76, 170, 310, 20), body("Option B\n\nFocused investment\nHigher return\nClear ownership", 540, 170, 310, 20), { id: newId("shape"), type: "shape", x: 470, y: 165, width: 2, height: 245, fill: theme.accent, shape: "rect" }]),
    slide("Data", "number", [title("What the data tells us"), { id: newId("text"), type: "text", x: 75, y: 185, width: 250, height: 140, text: "72%", color: theme.accent, fontSize: 86, bold: true }, body("A clear signal worth acting on now.", 80, 330, 280, 18), { id: newId("shape"), type: "shape", x: 470, y: 180, width: 72, height: 180, fill: theme.accent, shape: "round", radius: 7 }, { id: newId("shape"), type: "shape", x: 570, y: 235, width: 72, height: 125, fill: `${theme.accent}AA`, shape: "round", radius: 7 }, { id: newId("shape"), type: "shape", x: 670, y: 140, width: 72, height: 220, fill: `${theme.accent}66`, shape: "round", radius: 7 }]),
    slide("Quote", "quote", [{ id: newId("text"), type: "text", x: 122, y: 160, width: 700, height: 150, text: "“Clarity creates momentum.”", color: theme.foreground, fontSize: 42, italic: true, fontFamily: "DM Serif Display", align: "center" }, { id: newId("text"), type: "text", x: 250, y: 340, width: 460, height: 34, text: "A principle for the next decision", color: theme.accent, fontSize: 15, align: "center", letterSpacing: 1.5 }]),
    slide("Closing", "title", [title("Thank you.", 170, 52), body("Questions, discussion, and the next action.", 78, 295, 500, 21), bar(78, 370, 130)]),
  ];
  return { kind: "presentation", theme: spec.theme, format: spec.format || "wide", activeSlideId: slides[0].id, transition: "fade", slides };
}
