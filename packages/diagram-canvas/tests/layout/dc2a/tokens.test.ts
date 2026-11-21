import { component } from '../../../../tokens/dist/component.js';
import { DIAGRAM_SCENE_SPACING } from './spacing-tokens.js';
import { execFileSync } from 'node:child_process';
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

const token = (group: "diagramCard" | "diagramZone" | "diagramScene", leaf: string): string => (component[group] as Record<string,string>)[leaf]!;
const model = readFileSync(new URL("../../../../diagram-canvas/src/presentation/diagramCardModel.ts", import.meta.url), "utf8");

describe("DC-2a tokens (AC-6)", () => {
  it("engine defaults equal the token values", () => {
    expect(token("diagramZone", "childGapInline")).toBe("var(--st-component-diagramScene-gapMin)");
    expect(token("diagramScene", "gapMin")).toBe(`${DEFAULT_ROW_GAP}px`);
    expect(token("diagramZone", "childGapBlock")).toBe("var(--st-component-diagramScene-gapMinBlock)");
    expect(token("diagramZone", "gapInlineMax")).toBe("var(--st-component-diagramScene-gapMax)");
    expect(token("diagramZone", "gapBlockMax")).toBe("var(--st-component-diagramScene-gapMax)");
    expect(Number.parseFloat(token("diagramScene", "gapMax"))).toBe(DEFAULT_ROW_GAP_MAX);
    expect(DEFAULT_LAYOUT_METRICS.containerPadding).toBe(DIAGRAM_SCENE_SPACING.containerPadding);
    execFileSync(process.execPath, [new URL("../../../../../scripts/sync-diagram-spacing.mjs", import.meta.url).pathname, "--check"]);
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
    expect(shipped, "EDGE_LABEL_GEOMETRY in diagram-canvas/src/presentation/diagramCardModel.ts").not.toBeNull();
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

  // Décision du 21/11. « L'utilisateur a les boutons de zoom et autolayout. Par défaut quand on redimensionne on autolayout zoom intégral + plancher à 30 % ».
  it("fit: the R7 floor is 0.30", () => {
    expect(DEFAULT_MIN_READABLE_SCALE).toBe(0.30);
  });
});
