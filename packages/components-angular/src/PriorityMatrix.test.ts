import "@angular/compiler";
import type { SimpleChanges } from "@angular/core";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { PriorityMatrix } from "../dist/PriorityMatrix.js";
import type { PriorityMatrixDatum } from "../dist/PriorityMatrix.js";

const data: PriorityMatrixDatum[] = [
  { x: 18, y: 82, label: "Auth SSO" },
  { x: 70, y: 70, label: "Export PDF" },
  { x: 30, y: 30, label: "Thème sombre" },
  { x: 85, y: 15, label: "Chat temps réel" },
];

function component(): PriorityMatrix {
  const c = new PriorityMatrix();
  c.data = data;
  c.label = "Matrice";
  c.ngOnInit();
  return c;
}

describe("PriorityMatrix (parity with Svelte)", () => {
  it("exposes four quadrants, thresholds and one placed label per point", () => {
    const c = component();
    expect(c.quads).toHaveLength(4);
    expect(c.quadNames.map((q) => c.quadName(q.id))).toEqual([
      "Gains rapides",
      "Projets majeurs",
      "Attendre",
      "Ne pas faire",
    ]);
    expect(c.points).toHaveLength(data.length);
    expect(c.placed).toHaveLength(data.length);
    expect(c.dataValueItems).toHaveLength(data.length);
    expect(c.dataValueItems[0]).toContain("Auth SSO");
  });

  it("places non-overlapping labels inside the frame", () => {
    const c = component();
    const boxes = c.placed;
    for (let i = 0; i < boxes.length; i++) {
      const a = boxes[i]!;
      expect(a.x).toBeGreaterThanOrEqual(48 - 0.5);
      expect(a.y).toBeGreaterThanOrEqual(26 - 0.5);
      for (let j = i + 1; j < boxes.length; j++) {
        const b = boxes[j]!;
        const overlap = a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
        expect(overlap).toBe(false);
      }
    }
  });

  it("renders no literal style attribute or binding", () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const src = readFileSync(join(here, "PriorityMatrix.ts"), "utf8");
    expect(src).not.toMatch(/style\s*=/);
    expect(src).not.toMatch(/\[style\./);
  });

  it("computes the placement once per input change, not on every read", () => {
    const c = component();
    const first = c.placed;
    expect(first).toHaveLength(data.length);
    expect(c.placed).toBe(first);
    c.ngOnChanges({} as SimpleChanges);
    expect(c.placed).not.toBe(first);
    expect(c.placed).toHaveLength(data.length);
  });

  it("clamps non-finite values instead of exposing NaN", () => {
    const c = new PriorityMatrix();
    c.data = [
      { x: NaN, y: 82, label: "Bad X" },
      { x: 20, y: Infinity, label: "Bad Y" },
    ];
    c.label = "Matrice";
    c.ngOnInit();
    for (const p of c.points) {
      expect(Number.isFinite(p.cx)).toBe(true);
      expect(Number.isFinite(p.cy)).toBe(true);
    }
    expect(c.dataValueItems.join(" ")).not.toContain("NaN");
  });
});
