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
  MIN_EDGE_LABEL_CSS_PX,
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
const model = readFileSync(new URL("../../../../diagram-canvas/src/presentation/diagramCardModel.ts", import.meta.url), "utf8");

describe("DC-2a tokens (AC-6)", () => {
  it("engine defaults equal the token values", () => {
    expect(token("diagramZone", "childGapInline")).toBe(`${DEFAULT_ROW_GAP}px`);
    expect(token("diagramZone", "childGapBlock")).toBe(`72px`);
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
    const base = layScene(input, {}, hints);
    const wider = layScene(input, { metrics: { gapMin: 150, gapBase: 150, gapMinBlock: 120, gapBaseBlock: 120 } }, hints);
    const baseHorizontal = base.channels!.filter(channel => channel.axis === "horizontal");
    const widerHorizontal = wider.channels!.filter(channel => channel.axis === "horizontal");
    expect(baseHorizontal.length).toBeGreaterThan(0);
    expect(widerHorizontal.length).toBeGreaterThan(0);
    expect(Math.min(...baseHorizontal.map(channel => channel.gap))).toBeLessThan(150);
    expect(widerHorizontal.every(channel => channel.gap >= 150 && Math.abs(channel.gap - channel.expected) <= 1)).toBe(true);
    expect(wider.channels!.filter(channel => channel.axis === "vertical").every(channel => channel.gap >= 120)).toBe(true);
  });

  it("a sibling-gap override above the axis cap refuses; an invalid objective refuses", () => {
    const input = sceneInput("case-b", "unfolded");
    expect(() => layScene(input, {}, { cardGapY: 241 })).toThrow(/layout-hint-invalid/);
    expect(() => layScene(input, { rowPack: { targetAspect: 0 } })).toThrow(/row-pack-invalid/);
    expect(() => layScene(input, {}, { rootOrder: ["entity:rt-h2a" as never] })).toThrow(/layout-hint-invalid/);
  });
});

describe("DC-2a §5.3 display-scale calibration", () => {
  /** Card typography, world px, from the token source. */
  const TITLE = Number.parseFloat(token("diagramCard", "titleFontSize"));
  const BODY = Number.parseFloat(token("diagramCard", "bodyFontSize"));
  const round = (value: number): number => Math.round(value * 1000) / 1000;

  it("100 %: the smallest scale of [0.50, 0.75] holding an 18 px title and a 13 px body is 0.5625; 0.62 satisfies it and is kept", () => {
    expect([TITLE, BODY]).toEqual([32, 24]);
    const smallest = Math.max(18 / TITLE, 13 / BODY);
    expect(smallest).toBeCloseTo(0.5625, 6);
    expect(smallest).toBeGreaterThanOrEqual(0.5);
    expect(DEFAULT_MAX_DISPLAY_SCALE).toBeGreaterThanOrEqual(smallest);
    expect(DEFAULT_MAX_DISPLAY_SCALE).toBeLessThanOrEqual(0.75);
    expect(DEFAULT_MAX_DISPLAY_SCALE).toBe(0.62);
    expect(TITLE * DEFAULT_MAX_DISPLAY_SCALE).toBeCloseTo(19.84, 6);
    expect(BODY * DEFAULT_MAX_DISPLAY_SCALE).toBeCloseTo(14.88, 6);
    // A card renders at 285.2 × 124 CSS px at 100 %, never at 460 × 200 (AC-22).
    expect([460 * DEFAULT_MAX_DISPLAY_SCALE, 200 * DEFAULT_MAX_DISPLAY_SCALE].map(round)).toEqual([285.2, 124]);
  });

  it("fit: an 18 px edge label needs a scale of 0.444 to render at 8 CSS px; the floor is the next two-decimal scale, 0.45", () => {
    const needed = MIN_EDGE_LABEL_CSS_PX / DEFAULT_EDGE_LABEL_FONT_SIZE;
    expect(needed).toBeCloseTo(0.4444, 4);
    expect(Math.ceil(needed * 100) / 100).toBe(0.45);
    expect(DEFAULT_MIN_READABLE_SCALE).toBe(0.45);
    // 0.42, the value shipped by L1, rendered the label at 7.56 CSS px.
    expect(DEFAULT_EDGE_LABEL_FONT_SIZE * 0.42).toBeLessThan(MIN_EDGE_LABEL_CSS_PX);
    expect(DEFAULT_EDGE_LABEL_FONT_SIZE * DEFAULT_MIN_READABLE_SCALE).toBeGreaterThanOrEqual(MIN_EDGE_LABEL_CSS_PX);
  });
});
