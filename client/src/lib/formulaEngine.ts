/** Quiet Ledger spreadsheet engine: a deliberately scoped, extensible evaluator for safe arithmetic, references, ranges, and useful first functions. */
import type { SpreadsheetCell } from "./editorModels";

type CellMap = Record<string, SpreadsheetCell>;
const number = (value: unknown) => { const result = Number(value); return Number.isFinite(result) ? result : 0; };
const range = (start: string, end: string): string[] => { const parse = (key: string) => { const match = key.match(/^([A-Z]+)(\d+)$/i); if (!match) return null; const col = match[1].toUpperCase().split("").reduce((sum, letter) => sum * 26 + letter.charCodeAt(0) - 64, 0); return { col, row: Number(match[2]) }; }; const a = parse(start), b = parse(end); if (!a || !b) return []; const keys: string[] = []; for (let row = Math.min(a.row, b.row); row <= Math.max(a.row, b.row); row += 1) for (let col = Math.min(a.col, b.col); col <= Math.max(a.col, b.col); col += 1) { let value = col; let letters = ""; while (value > 0) { const mod = (value - 1) % 26; letters = String.fromCharCode(65 + mod) + letters; value = Math.floor((value - 1) / 26); } keys.push(`${letters}${row}`); } return keys; };

export function calculate(raw: string, cells: CellMap, seen = new Set<string>()): string | number {
  if (!raw.startsWith("=")) return raw;
  const evaluate = (formula: string): string | number => {
    const body = formula.slice(1).trim();
    const functionMatch = body.match(/^(SUM|AVERAGE|MIN|MAX|COUNT|COUNTA)\(([^)]+)\)$/i);
    if (functionMatch) { const refs = functionMatch[2].split(",").flatMap(value => { const parts = value.trim().toUpperCase().split(":"); return parts.length === 2 ? range(parts[0], parts[1]) : [parts[0]]; }); const values = refs.map(ref => readRef(ref)); const numeric = values.map(number); const name = functionMatch[1].toUpperCase(); if (name === "SUM") return numeric.reduce((sum, value) => sum + value, 0); if (name === "AVERAGE") return numeric.length ? numeric.reduce((sum, value) => sum + value, 0) / numeric.length : 0; if (name === "MIN") return numeric.length ? Math.min(...numeric) : 0; if (name === "MAX") return numeric.length ? Math.max(...numeric) : 0; if (name === "COUNT") return values.filter(value => Number.isFinite(Number(value)) && String(value).trim() !== "").length; return values.filter(value => String(value).trim() !== "").length; }
    const ifMatch = body.match(/^IF\((.+?),(.+?),(.+)\)$/i); if (ifMatch) { const condition = ifMatch[1].replace(/([A-Z]+\d+)/gi, ref => String(readRef(ref))); const allowed = /^[0-9.\s<>=!+\-*/()]+$/; if (!allowed.test(condition)) return "#ERROR"; const passed = Function(`"use strict"; return (${condition});`)(); const branch = (passed ? ifMatch[2] : ifMatch[3]).trim(); if (/^".*"$/.test(branch)) return branch.slice(1, -1); return evaluate(`=${branch}`); }
    const roundMatch = body.match(/^ROUND\((.+?),(\d+)\)$/i); if (roundMatch) { const value = number(evaluate(`=${roundMatch[1]}`)); const digits = Number(roundMatch[2]); return Number(value.toFixed(digits)); }
    const absMatch = body.match(/^ABS\((.+)\)$/i); if (absMatch) return Math.abs(number(evaluate(`=${absMatch[1]}`)));
    const expression = body.replace(/([A-Z]+\d+)/gi, ref => String(number(readRef(ref)))); if (!/^[0-9+\-*/().\s]+$/.test(expression)) return "#ERROR"; try { const result = Function(`"use strict"; return (${expression});`)(); return Number.isFinite(result) ? result : "#ERROR"; } catch { return "#ERROR"; }
  };
  const readRef = (ref: string): string | number => { const key = ref.toUpperCase(); if (seen.has(key)) return "#CYCLE"; const value = cells[key]?.value ?? ""; if (value.startsWith("=")) { const next = new Set(seen); next.add(key); return calculate(value, cells, next); } return value; };
  try { return evaluate(raw); } catch { return "#ERROR"; }
}

export function displayValue(cell: SpreadsheetCell | undefined, cells: CellMap) { if (!cell) return ""; const value = calculate(cell.value, cells); if (typeof value === "string" && value.startsWith("#")) return value; const format = cell.style?.format; const decimals = cell.style?.decimals ?? 0; if (format === "currency") return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(number(value)); if (format === "percent") return `${(number(value) * 100).toFixed(decimals)}%`; if (format === "number") return number(value).toFixed(decimals); return value; }
