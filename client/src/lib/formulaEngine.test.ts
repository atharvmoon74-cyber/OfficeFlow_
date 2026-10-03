/** Formula engine regression checks for OfficeFlow Spreadsheet Studio’s local-first calculation foundation. */
import { describe, expect, it } from "vitest";
import { calculate } from "./formulaEngine";

const cells = { A1: { value: "12" }, A2: { value: "8" }, A3: { value: "4" }, B1: { value: "=SUM(A1:A3)" }, B2: { value: "OfficeFlow" } };

describe("OfficeFlow formula engine", () => {
  it("evaluates arithmetic, direct references, and supported range functions", () => {
    expect(calculate("=A1+A2*2", cells)).toBe(28);
    expect(calculate("=B1", cells)).toBe(24);
    expect(calculate("=AVERAGE(A1:A3)", cells)).toBe(8);
    expect(calculate("=MIN(A1:A3)", cells)).toBe(4);
    expect(calculate("=MAX(A1:A3)", cells)).toBe(12);
    expect(calculate("=COUNT(A1:B2)", cells)).toBe(3);
    expect(calculate("=COUNTA(A1:B2)", cells)).toBe(4);
    expect(calculate("=ROUND(A1/7,2)", cells)).toBe(1.71);
    expect(calculate("=ABS(-A2)", cells)).toBe(8);
    expect(calculate("=IF(A1>10,\"ready\",\"waiting\")", cells)).toBe("ready");
  });

  it("returns an understandable error for unsupported formulas", () => {
    expect(calculate("=UNKNOWN(A1)", cells)).toBe("#ERROR");
  });
});
