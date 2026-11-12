/**
 * DC-2a AC-6 — the engine's row-pack and camera defaults mirror the DS tokens.
 *
 * `diagram-canvas` depends on `@sentropic/diagram-core` only, so the tokens are
 * read from their source file rather than imported: a token value that moves
 * without its engine default (or the reverse) turns this test red.
 */
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  DEFAULT_MAX_DISPLAY_SCALE,
  DEFAULT_MIN_READABLE_SCALE,
  DEFAULT_ROW_GAP,
  DEFAULT_ROW_GAP_MAX,
  DEFAULT_ROW_PACK,
} from "../../../src/index.js";
import { layScene, sceneInput } from "./scenes.js";

const source = readFileSync(new URL("../../../../tokens/src/component.ts", import.meta.url), "utf8");
const token = (leaf: string): string => {
  const match = new RegExp(`\\b${leaf}: "([^"]+)"`).exec(source);
  if (match === null) throw new Error(`token leaf ${leaf} not found in packages/tokens/src/component.ts`);
  return match[1]!;
};

describe("DC-2a tokens (AC-6)", () => {
  it("engine defaults equal the token values", () => {
    expect(token("childGapInline")).toBe(`${DEFAULT_ROW_GAP}px`);
    expect(token("childGapBlock")).toBe(`${DEFAULT_ROW_GAP}px`);
    expect(token("gapInlineMax")).toBe(`${DEFAULT_ROW_GAP_MAX}px`);
    expect(token("gapBlockMax")).toBe(`${DEFAULT_ROW_GAP_MAX}px`);
    expect(Number(token("rowPackTargetAspect"))).toBe(DEFAULT_ROW_PACK.targetAspect);
    expect(Number(token("maxDisplayScale"))).toBe(DEFAULT_MAX_DISPLAY_SCALE);
    expect(Number(token("minReadableScale"))).toBe(DEFAULT_MIN_READABLE_SCALE);
    expect(token("rootGapInline")).toBe("var(--st-component-diagramZone-childGapInline)");
    expect(token("rootGapBlock")).toBe("var(--st-component-diagramZone-childGapBlock)");
    expect(token("transitionDuration")).toBe("240ms");
  });

  it("a gap token value passed as a metric changes the geometry in the same call", () => {
    const input = sceneInput("case-skills-r9", "unfolded");
    const hints = { rootOrder: input.rootOrder };
    const base = layScene(input, { rowPack: {} }, hints);
    const tight = layScene(input, { rowPack: {}, metrics: { rowGapInline: 16, rowGapBlock: 16 } }, hints);
    const first = base.rects.get("harness-router")!;
    const second = base.rects.get("method-using-harness")!;
    const tightFirst = tight.rects.get("harness-router")!;
    const tightSecond = tight.rects.get("method-plan")!;
    expect(second.x - (first.x + first.width)).toBeGreaterThanOrEqual(24);
    expect(tightSecond.x - (tightFirst.x + tightFirst.width)).toBeLessThan(24);
  });

  it("a sibling-gap override above the axis cap refuses; an invalid objective refuses", () => {
    const input = sceneInput("case-b", "unfolded");
    expect(() => layScene(input, { rowPack: {} }, { cardGapY: 40 })).toThrow(/layout-hint-invalid/);
    expect(() => layScene(input, { rowPack: { targetAspect: 0 } })).toThrow(/row-pack-invalid/);
    expect(() => layScene(input, { rowPack: {} }, { rootOrder: ["entity:rt-h2a" as never] })).toThrow(/layout-hint-invalid/);
  });
});
