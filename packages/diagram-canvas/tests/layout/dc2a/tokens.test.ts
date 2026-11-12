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
  DEFAULT_EDGE_LABEL_FONT_SIZE,
  DEFAULT_EDGE_LABEL_LINE_HEIGHT,
  DEFAULT_LAYOUT_METRICS,
  DEFAULT_MAX_DISPLAY_SCALE,
  DEFAULT_MIN_READABLE_SCALE,
  DEFAULT_ROW_GAP,
  DEFAULT_ROW_GAP_MAX,
  DEFAULT_ROW_PACK,
} from "../../../src/index.js";
import { layScene, PINNED_LINE_HEIGHT, pinnedMeasurer, sceneInput } from "./scenes.js";

const source = readFileSync(new URL("../../../../tokens/src/component.ts", import.meta.url), "utf8");
/** The object literal of one component group: from `<group>: {` to its closing brace (leaves are flat). */
const groupSource = (group: string): string => {
  const start = source.indexOf(`\n    ${group}: {`);
  if (start < 0) throw new Error(`token group ${group} not found in packages/tokens/src/component.ts`);
  const end = source.indexOf("\n    }", start);
  return source.slice(start, end);
};
/** One leaf of one group — never a same-named leaf of another component. */
const token = (group: "diagramCard" | "diagramZone" | "diagramScene", leaf: string): string => {
  const match = new RegExp(`\\b${leaf}: "([^"]+)"`).exec(groupSource(group));
  if (match === null) throw new Error(`token leaf ${group}.${leaf} not found in packages/tokens/src/component.ts`);
  return match[1]!;
};
const model = readFileSync(new URL("../../../../components-svelte/src/lib/diagramCardModel.ts", import.meta.url), "utf8");

describe("DC-2a tokens (AC-6)", () => {
  it("engine defaults equal the token values", () => {
    expect(token("diagramZone", "childGapInline")).toBe(`${DEFAULT_ROW_GAP}px`);
    expect(token("diagramZone", "childGapBlock")).toBe(`${DEFAULT_ROW_GAP}px`);
    expect(token("diagramZone", "gapInlineMax")).toBe(`${DEFAULT_ROW_GAP_MAX}px`);
    expect(token("diagramZone", "gapBlockMax")).toBe(`${DEFAULT_ROW_GAP_MAX}px`);
    expect(Number(token("diagramZone", "rowPackTargetAspect"))).toBe(DEFAULT_ROW_PACK.targetAspect);
    expect(Number(token("diagramScene", "maxDisplayScale"))).toBe(DEFAULT_MAX_DISPLAY_SCALE);
    expect(Number(token("diagramScene", "minReadableScale"))).toBe(DEFAULT_MIN_READABLE_SCALE);
    expect(token("diagramCard", "rootGapInline")).toBe("var(--st-component-diagramZone-childGapInline)");
    expect(token("diagramCard", "rootGapBlock")).toBe("var(--st-component-diagramZone-childGapBlock)");
    expect(token("diagramScene", "transitionDuration")).toBe("240ms");
    expect(token("diagramScene", "edgeLabelFontSize")).toBe(`${DEFAULT_EDGE_LABEL_FONT_SIZE}px`);
    expect(token("diagramScene", "edgeLabelLineHeight")).toBe(`${DEFAULT_EDGE_LABEL_LINE_HEIGHT}px`);
  });

  it("the edge-label line box is one number in the token, the shipped measurer and the test measurer", () => {
    // The harness measurer must not measure a label thinner than production:
    // a 20 px test label against a 31.2 px shipped one would place labels in
    // gutters the product cannot use.
    const shipped = /export const EDGE_LABEL_GEOMETRY = \{ size: (\d+), weight: \d+, lineHeight: (\d+) \} as const;/.exec(model);
    expect(shipped, "EDGE_LABEL_GEOMETRY in components-svelte/src/lib/diagramCardModel.ts").not.toBeNull();
    expect(Number(shipped![1])).toBe(DEFAULT_EDGE_LABEL_FONT_SIZE);
    expect(Number(shipped![2])).toBe(DEFAULT_EDGE_LABEL_LINE_HEIGHT);
    expect(PINNED_LINE_HEIGHT["edge-label"]).toBe(DEFAULT_EDGE_LABEL_LINE_HEIGHT);
    const label = pinnedMeasurer({ text: "lance · appelle", role: "edge-label", availableWidth: 400, allocatedLines: 1, folded: false });
    expect(label.height).toBe(DEFAULT_EDGE_LABEL_LINE_HEIGHT);
    // One line plus its two margins fits the capped gutter on both axes.
    const needed = DEFAULT_EDGE_LABEL_LINE_HEIGHT + 2 * DEFAULT_LAYOUT_METRICS.labelMargin;
    expect(needed).toBe(30);
    expect(needed).toBeLessThanOrEqual(DEFAULT_ROW_GAP_MAX);
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
