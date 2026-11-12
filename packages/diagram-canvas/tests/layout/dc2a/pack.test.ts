/**
 * DC-2a L1 — packer, orientation and camera unit tests (SPEC_EVOL_DC2A §9.1, §5).
 */
import { describe, expect, it } from "vitest";

import {
  cameraFit,
  chooseOrientation,
  clampZoom,
  DEFAULT_EDGE_LABEL_FONT_SIZE,
  DEFAULT_MAX_DISPLAY_SCALE,
  DEFAULT_MIN_READABLE_SCALE,
  edgeLabelCssPx,
  DEFAULT_ROW_PACK,
  fitBox,
  MIN_EDGE_LABEL_CSS_PX,
  packColumns,
  packRows,
  resolveRowPack,
  validateRowPack,
  zoomReadout,
  type PackBox,
  type PackOptions,
} from "../../../src/index.js";

const CARD: PackBox = { width: 460, height: 200 };
const cards = (count: number): PackBox[] => Array.from({ length: count }, () => CARD);
const options = (chrome: "root" | "zone", extra: Partial<PackOptions> = {}): PackOptions => ({
  targetAspect: DEFAULT_ROW_PACK.targetAspect,
  gapX: 24,
  gapY: 24,
  // Zone chrome: 2 × 16 inline; 16 + header (71) + 16 + 16 block.
  chromeWidth: chrome === "zone" ? 32 : 0,
  chromeHeight: chrome === "zone" ? 119 : 0,
  tallBias: DEFAULT_ROW_PACK.tallBias,
  emptyPenaltyWeight: DEFAULT_ROW_PACK.emptyPenaltyWeight,
  ...extra,
});
const shape = (rows: readonly (readonly number[])[]): number[] => rows.map((row) => row.length);

describe("packRows / packColumns", () => {
  it.each(["root", "zone"] as const)("AC-2: canonical equal-card grids at %s chrome", (chrome) => {
    // §3.6: 2 → 1×2, 3 → 2+1, 4 → 2×2, 9 → 3×3 at both chromes. Six cards are
    // the one grid the chrome decides: the P-3 optimum is 3 rows of 2 at chrome
    // 0 (944 × 648, aspect 1.46) and 2 rows of 3 inside a zone, whose header
    // and insets add height (outer 1460 × 543, aspect 2.69 against 1.27).
    const six = chrome === "zone" ? [3, 3] : [2, 2, 2];
    const grids: Record<number, number[]> = { 2: [2], 3: [2, 1], 4: [2, 2], 6: six, 9: [3, 3, 3] };
    for (const [count, expected] of Object.entries(grids)) {
      expect(shape(packRows(cards(Number(count)), options(chrome)).rows), `rows n=${count}`).toEqual(expected);
    }
  });

  it("P-8: the columns form is the transpose of the rows form", () => {
    const boxes: PackBox[] = [
      { width: 460, height: 200 },
      { width: 300, height: 120 },
      { width: 460, height: 260 },
      { width: 200, height: 200 },
      { width: 460, height: 200 },
    ];
    const transposed = boxes.map((box) => ({ width: box.height, height: box.width }));
    const base = options("root");
    const columns = packColumns(boxes, base);
    const rows = packRows(transposed, { ...base, targetAspect: 1 / base.targetAspect, tallBias: 1 });
    const flipped = packColumns(boxes, { ...base, tallBias: 1 });
    expect(shape(flipped.rows)).toEqual(shape(rows.rows));
    expect(flipped.positions.map((position) => [position.y, position.x])).toEqual(rows.positions.map((position) => [position.x, position.y]));
    expect(columns.rows.flat()).toEqual([0, 1, 2, 3, 4]);
  });

  it("P-2: reading order is never permuted, even when reordering would score better", () => {
    const boxes: PackBox[] = [
      { width: 900, height: 200 },
      { width: 100, height: 200 },
      { width: 900, height: 200 },
      { width: 100, height: 200 },
    ];
    for (const result of [packRows(boxes, options("root")), packColumns(boxes, options("root"))]) {
      expect(result.rows.flat()).toEqual([0, 1, 2, 3]);
    }
  });

  it("P-3/BF-1: no candidate stacks two boxes or more in one single vertical column, in either form", () => {
    // At chrome 0 the 2 × 1 column scores lower (0.79) than the 1 × 2 row (0.98);
    // admissibility, not the score, excludes it. A shelf of the rows form is a
    // row, a shelf of the columns form is a column: the single vertical column
    // is `rows.length === n` in rows form and `rows.length === 1` in columns form.
    expect(shape(packRows(cards(2), options("root")).rows)).toEqual([2]);
    expect(shape(packColumns(cards(2), options("root")).rows)).toEqual([1, 1]);
    for (const chrome of ["root", "zone"] as const) {
      for (const count of [2, 3, 4, 5, 6, 9, 12]) {
        const rows = packRows(cards(count), options(chrome));
        const columns = packColumns(cards(count), options(chrome));
        expect(rows.rows.length, `rows n=${count} ${chrome}`).toBeLessThan(count);
        expect(columns.rows.length, `columns n=${count} ${chrome}`).toBeGreaterThan(1);
        for (const result of [rows, columns]) {
          const oneColumn = result.positions.every((position) => position.x === result.positions[0]!.x);
          expect(oneColumn, `n=${count} ${chrome}`).toBe(false);
        }
      }
    }
    // Two equal cards: both forms draw the same 1 × 2 line, so the level reads as rows (O-3).
    const two = chooseOrientation(cards(2), options("root"), 0.08);
    expect([two.orientation, two.result.width, two.result.height]).toEqual(["rows", 944, 200]);
  });

  it("P-6/P-7: degenerate inputs and top-aligned rows", () => {
    expect(packRows([], options("root"))).toEqual({ width: 0, height: 0, rows: [], positions: [], score: 0 });
    const one = packRows([CARD], options("root"));
    expect([one.width, one.height, shape(one.rows)]).toEqual([460, 200, [1]]);
    const mixed = packRows(
      [
        { width: 460, height: 200 },
        { width: 460, height: 320 },
      ],
      options("root"),
    );
    expect(mixed.positions.map((position) => position.y)).toEqual([0, 0]);
    expect(mixed.height).toBe(320);
  });

  it("P-1/P-5: emitted gaps are exactly the given gaps", () => {
    const result = packRows(cards(6), options("zone", { gapX: 24, gapY: 28 }));
    expect(result.positions.map((position) => position.x)).toEqual([0, 484, 968, 0, 484, 968]);
    expect(result.positions.map((position) => position.y)).toEqual([0, 0, 0, 228, 228, 228]);
    expect([result.width, result.height]).toEqual([1428, 428]);
  });

  it("the tall bias and the empty penalty steer the choice", () => {
    // Five cards: 2 + 2 + 1 is closer to 16:9 than the wider 3 + 2.
    expect(shape(packRows(cards(5), options("root")).rows)).toEqual([2, 2, 1]);
    expect(shape(packRows(cards(5), options("root", { tallBias: 6 })).rows)).toEqual([3, 2]);
    expect(packRows(cards(3), options("root", { emptyPenaltyWeight: 0 })).score).toBeLessThan(
      packRows(cards(3), options("root", { emptyPenaltyWeight: 0.8 })).score,
    );
    const tall = packRows(cards(12), options("root", { tallBias: 4 }));
    const flat = packRows(cards(12), options("root", { tallBias: 1 }));
    expect(tall.rows.length).toBeLessThanOrEqual(flat.rows.length);
  });
});

describe("chooseOrientation", () => {
  it("O-2/O-3: the lower total score wins; an empty or single-box level is rows", () => {
    expect(chooseOrientation([], options("root"), 0.08).orientation).toBe("rows");
    expect(chooseOrientation([CARD], options("root"), 0.08).orientation).toBe("rows");
    const choice = chooseOrientation(cards(2), options("root"), 0.08);
    expect(choice.orientation).toBe(choice.scoreRows <= choice.scoreColumns ? "rows" : "columns");
    // Ten equal cards in a zone read as rows.
    expect(chooseOrientation(cards(10), options("zone"), 0.08).orientation).toBe("rows");
  });

  it("O-4/AC-17: inside the band the previous orientation is kept; outside it the lower score wins", () => {
    // Three boxes whose two forms score differently: a wide one then two cards.
    const boxes: PackBox[] = [{ width: 976, height: 320 }, CARD, CARD];
    const free = chooseOrientation(boxes, options("root"), 0);
    const gap = Math.abs(free.scoreRows - free.scoreColumns);
    expect(gap).toBeGreaterThan(0.01);
    const loser = free.orientation === "rows" ? "columns" : "rows";
    expect(chooseOrientation(boxes, options("root"), gap + 0.01, loser).orientation).toBe(loser);
    expect(chooseOrientation(boxes, options("root"), gap - 0.01, loser).orientation).toBe(free.orientation);
    // Fixed point (O-5): feeding the emitted orientation back changes nothing.
    expect(chooseOrientation(boxes, options("root"), 0.08, free.orientation).orientation).toBe(free.orientation);
  });

  it("BLK-4: O-4 precedes the O-3 tie-break — a previous orientation inside the band is kept even on one same outer box", () => {
    // Three equal cards fill the same 944 × 424 box in both forms; the score
    // gap is shelf-slack bookkeeping inside the 0.08 band, so O-4 keeps the
    // previous orientation instead of forcing rows (SPEC §3.2 O-3/O-4).
    for (const chrome of ["root", "zone"] as const) {
      const rows = packRows(cards(3), options(chrome));
      const columns = packColumns(cards(3), options(chrome));
      expect([columns.width, columns.height]).toEqual([rows.width, rows.height]);
      const gap = Math.abs(rows.score - columns.score);
      expect(gap).toBeGreaterThan(1e-9);
      expect(gap).toBeLessThan(0.08);
      expect(chooseOrientation(cards(3), options(chrome), 0.08, "columns").orientation).toBe("columns");
      expect(chooseOrientation(cards(3), options(chrome), 0.08, "rows").orientation).toBe("rows");
      expect(chooseOrientation(cards(3), options(chrome), 0.08, undefined).orientation).toBe("rows");
    }
    // s2-h2a-like unfolded shape (460×262 + 2 × 460×200): whatever the free
    // choice, a previous orientation inside the band is kept (O-4 first).
    const mixed: PackBox[] = [
      { width: 460, height: 262 },
      { width: 460, height: 200 },
      { width: 460, height: 200 },
    ];
    const free = chooseOrientation(mixed, options("root"), 0);
    const gapMixed = Math.abs(free.scoreRows - free.scoreColumns);
    expect(gapMixed).toBeLessThan(0.08);
    const loserMixed = free.orientation === "rows" ? "columns" : "rows";
    expect(chooseOrientation(mixed, options("root"), 0.08, loserMixed).orientation).toBe(loserMixed);
    expect(chooseOrientation(mixed, options("root"), 0.08, free.orientation).orientation).toBe(free.orientation);
  });

  it("O-3: exact ties read as rows without a previous orientation — O-4 keeps a previous orientation first", () => {
    // Two equal cards: both forms draw the same line, scores equal to the last bit.
    // With no previous orientation the tie reads rows; with one inside the band
    // O-4 keeps it (exact fix order: previous first, then the epsilon tie-break).
    const two = chooseOrientation(cards(2), options("root"), 0.08, "columns");
    expect(Math.abs(two.scoreRows - two.scoreColumns)).toBeLessThanOrEqual(1e-9);
    expect(two.orientation).toBe("columns");
    expect(chooseOrientation(cards(2), options("root"), 0.08, undefined).orientation).toBe("rows");
    // Three equal cards fill the same 944 × 424 box but the scores differ by
    // shelf-slack bookkeeping inside the band: O-4 keeps the previous
    // orientation, only the map-free choice reads rows.
    for (const chrome of ["root", "zone"] as const) {
      const rows = packRows(cards(3), options(chrome));
      const columns = packColumns(cards(3), options(chrome));
      expect([columns.width, columns.height]).toEqual([rows.width, rows.height]);
      const gap = Math.abs(rows.score - columns.score);
      expect(gap).toBeGreaterThan(1e-9);
      expect(gap).toBeLessThan(0.08);
      expect(chooseOrientation(cards(3), options(chrome), 0.08, "columns").orientation).toBe("columns");
      expect(chooseOrientation(cards(3), options(chrome), 0.08, "rows").orientation).toBe("rows");
      expect(chooseOrientation(cards(3), options(chrome), 0.08, undefined).orientation).toBe("rows");
    }
  });
});

describe("row-pack options", () => {
  it("resolves the DS defaults in one place and refuses invalid numbers", () => {
    expect(resolveRowPack({})).toEqual({ targetAspect: 1.78, tallBias: 1.6, emptyPenaltyWeight: 0.4, orientationHysteresis: 0.08 });
    expect(validateRowPack(resolveRowPack({}))).toEqual([]);
    for (const bad of [{ targetAspect: 0 }, { targetAspect: Number.NaN }, { tallBias: -1 }, { emptyPenaltyWeight: -0.1 }, { orientationHysteresis: -1 }]) {
      const refusals = validateRowPack(resolveRowPack(bad));
      expect(refusals.map((refusal) => [refusal.code, refusal.path])).toEqual([["row-pack-invalid", "rowPack"]]);
    }
  });
});

describe("camera fit (§5)", () => {
  it("AC-22: readout 100 % is the maximum display scale, well below the natural card size", () => {
    expect(DEFAULT_MAX_DISPLAY_SCALE).toBe(0.62);
    expect(zoomReadout(DEFAULT_MAX_DISPLAY_SCALE)).toBe(100);
    expect(zoomReadout(0.31)).toBe(50);
    // §5.3 calibration at 100 %: title 32 px and body 24 px render at ≥ 18 and ≥ 13 CSS px.
    expect(32 * DEFAULT_MAX_DISPLAY_SCALE).toBeGreaterThanOrEqual(18);
    expect(24 * DEFAULT_MAX_DISPLAY_SCALE).toBeGreaterThanOrEqual(13);
    expect([Math.round(460 * DEFAULT_MAX_DISPLAY_SCALE), Math.round(200 * DEFAULT_MAX_DISPLAY_SCALE)]).toEqual([285, 124]);
  });

  it("AC-23: the fit box is 16:9 bounded by the window; the tighter axis decides", () => {
    expect(fitBox(1440, 2000)).toEqual({ width: 1440, height: 810 });
    expect(fitBox(1440, 800)).toEqual({ width: 1440, height: 680 });
    const wide = cameraFit({ bounds: { width: 2880, height: 810 }, viewWidth: 1440, windowHeight: 2000 });
    expect(wide.zoomFit).toBe(0.5);
    const tall = cameraFit({ bounds: { width: 1440, height: 1620 }, viewWidth: 1440, windowHeight: 2000 });
    expect(tall.zoomFit).toBe(0.5);
    expect(tall.pans).toBe(false);
  });

  it("AC-13/AC-14: fit never exceeds the cap, an empty scene fits at 100 %, zoom clamps into the range", () => {
    const small = cameraFit({ bounds: { width: 460, height: 200 }, viewWidth: 1440, windowHeight: 2000 });
    expect([small.zoomFit, small.zoom, small.maxZoom]).toEqual([0.62, 0.62, 0.62]);
    const empty = cameraFit({ viewWidth: 1440, windowHeight: 2000 });
    expect([empty.zoom, zoomReadout(empty.zoom)]).toEqual([0.62, 100]);
    const fit = cameraFit({ bounds: { width: 2880, height: 810 }, viewWidth: 1440, windowHeight: 2000 });
    expect(clampZoom(5, fit)).toBe(0.62);
    expect(clampZoom(0.01, fit)).toBe(0.5);
    expect(clampZoom(0.55, fit)).toBe(0.55);
  });

  it("readability floor: a drawing larger than the floor allows is held at the floor and pans", () => {
    expect(DEFAULT_MIN_READABLE_SCALE).toBe(0.45);
    const huge = cameraFit({ bounds: { width: 460, height: 8000 }, viewWidth: 1440, windowHeight: 2000 });
    expect(huge.zoomFit).toBeCloseTo(810 / 8000, 6);
    expect(huge.zoom).toBe(0.45);
    expect(huge.pans).toBe(true);
    // Zoom-out still reaches the whole drawing (Z-2).
    expect(clampZoom(0, huge)).toBeCloseTo(810 / 8000, 6);
  });

  it("§5.3: an edge label renders at 8 CSS px or more at the floor; 0.45 is the smallest two-decimal floor that holds it", () => {
    expect(DEFAULT_EDGE_LABEL_FONT_SIZE).toBe(18);
    expect(edgeLabelCssPx(DEFAULT_MIN_READABLE_SCALE)).toBeGreaterThanOrEqual(MIN_EDGE_LABEL_CSS_PX);
    expect(edgeLabelCssPx(DEFAULT_MIN_READABLE_SCALE)).toBeCloseTo(8.1, 6);
    // The former floor (0.42) and the next step down (0.44) both render the label under 8 CSS px.
    expect(edgeLabelCssPx(0.42)).toBeLessThan(MIN_EDGE_LABEL_CSS_PX);
    expect(edgeLabelCssPx(0.44)).toBeLessThan(MIN_EDGE_LABEL_CSS_PX);
    // Every fit, whatever the drawing, shows the label at the minimum or more.
    for (const height of [200, 810, 2000, 8000, 40000]) {
      const fit = cameraFit({ bounds: { width: 2000, height }, viewWidth: 1440, windowHeight: 2000 });
      expect(edgeLabelCssPx(fit.zoom), String(height)).toBeGreaterThanOrEqual(MIN_EDGE_LABEL_CSS_PX);
    }
  });
});
