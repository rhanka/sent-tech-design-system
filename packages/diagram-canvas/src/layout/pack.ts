/**
 * DC-2a shelf packing toward a target aspect ratio (SPEC_EVOL_DC2A §3, §4).
 *
 * One pure function family for every nesting level (root and expanded zones):
 * boxes are taken in declaration order and filled into shelves; the candidate
 * shelf lengths are the prefix sums of the boxes; the candidate whose outer
 * aspect (chrome included) is closest to the target wins. `packRows` runs the
 * shelves horizontally (rows that wrap downward), `packColumns` is its exact
 * transpose (columns that wrap rightward), and `chooseOrientation` scores both
 * and keeps the previous orientation inside the hysteresis band.
 *
 * Nothing here knows about documents, occurrences or tokens: sizes and gaps
 * arrive as numbers and positions leave relative to the content origin.
 */

export interface PackBox {
  readonly width: number;
  readonly height: number;
}

export interface PackOptions {
  /** Target outer aspect (width / height), chrome included. */
  readonly targetAspect: number;
  readonly gapX: number;
  readonly gapY: number;
  readonly chromeWidth: number;
  readonly chromeHeight: number;
  /** Multiplier of the log distance when the candidate is taller than the target. */
  readonly tallBias: number;
  /** Weight of the shelf-slack area ratio added to the log distance. */
  readonly emptyPenaltyWeight: number;
}

export interface PackPosition {
  readonly x: number;
  readonly y: number;
  /** Index of the shelf the box sits on (row in rows form, column in columns form). */
  readonly row: number;
  /** Index of the box inside its shelf. */
  readonly col: number;
}

export interface PackResult {
  readonly width: number;
  readonly height: number;
  /** Shelves in order; concatenated they are always `[0, 1, …, n-1]` (P-2). */
  readonly rows: readonly (readonly number[])[];
  readonly positions: readonly PackPosition[];
  /** Total P-3 score of the chosen candidate (0 for an empty or single-box level). */
  readonly score: number;
}

export type PackOrientation = "rows" | "columns";

/** P-1: shelf-fill tolerance, in px. */
export const PACK_FILL_TOLERANCE = 0.5;
/** P-4 / O-3: two scores closer than this are equal. */
export const PACK_SCORE_EPSILON = 1e-9;

interface Shelves {
  readonly shelves: readonly (readonly number[])[];
  /** Extent along the shelf axis (widest shelf). */
  readonly main: number;
  /** Extent across the shelves (shelf thicknesses plus gaps). */
  readonly cross: number;
  /** Shelf slack area: (main − shelf length) × shelf thickness, summed. */
  readonly slack: number;
}

/** Fill boxes into shelves no longer than `limit`, in declaration order. */
function fillShelves(
  along: readonly number[],
  across: readonly number[],
  limit: number,
  gapAlong: number,
  gapAcross: number,
): Shelves {
  const shelves: number[][] = [];
  const lengths: number[] = [];
  const thicknesses: number[] = [];
  let current: number[] = [];
  let length = 0;
  let thickness = 0;
  for (let index = 0; index < along.length; index += 1) {
    const size = along[index]!;
    const next = current.length === 0 ? size : length + gapAlong + size;
    if (current.length > 0 && next > limit + PACK_FILL_TOLERANCE) {
      shelves.push(current);
      lengths.push(length);
      thicknesses.push(thickness);
      current = [index];
      length = size;
      thickness = across[index]!;
    } else {
      current.push(index);
      length = next;
      thickness = Math.max(thickness, across[index]!);
    }
  }
  if (current.length > 0) {
    shelves.push(current);
    lengths.push(length);
    thicknesses.push(thickness);
  }
  const main = Math.max(0, ...lengths);
  let cross = 0;
  let slack = 0;
  thicknesses.forEach((value, index) => {
    cross += value + (index > 0 ? gapAcross : 0);
    slack += (main - lengths[index]!) * value;
  });
  return { shelves, main, cross, slack };
}

/** P-3 total score of a content box: log aspect distance (tall-biased) plus the empty-area term. */
export function packScore(width: number, height: number, slack: number, options: PackOptions): number {
  const outerWidth = width + options.chromeWidth;
  const outerHeight = height + options.chromeHeight;
  if (outerWidth <= 0 || outerHeight <= 0) return 0;
  const ratio = outerWidth / outerHeight / options.targetAspect;
  const distance = Math.abs(Math.log(ratio));
  const biased = ratio < 1 ? distance * options.tallBias : distance;
  const area = width * height;
  return biased + (area > 0 ? options.emptyPenaltyWeight * (slack / area) : 0);
}

function pack(boxes: readonly PackBox[], options: PackOptions, orientation: PackOrientation): PackResult {
  const count = boxes.length;
  if (count === 0) return { width: 0, height: 0, rows: [], positions: [], score: 0 };
  const rows = orientation === "rows";
  const along = boxes.map((box) => (rows ? box.width : box.height));
  const across = boxes.map((box) => (rows ? box.height : box.width));
  const gapAlong = rows ? options.gapX : options.gapY;
  const gapAcross = rows ? options.gapY : options.gapX;

  let best: { shelves: Shelves; score: number; width: number } | undefined;
  const seen = new Set<string>();
  let prefix = 0;
  for (let index = 0; index < count; index += 1) {
    prefix += along[index]! + (index > 0 ? gapAlong : 0);
    const shelves = fillShelves(along, across, prefix, gapAlong, gapAcross);
    const key = shelves.shelves.map((shelf) => shelf.length).join(",");
    if (seen.has(key)) continue;
    seen.add(key);
    // P-3 admissibility (DEC-1): with two boxes or more, the candidate whose
    // every shelf holds a single box is removed before scoring.
    if (count >= 2 && shelves.shelves.length === count) continue;
    const width = rows ? shelves.main : shelves.cross;
    const height = rows ? shelves.cross : shelves.main;
    const score = count === 1 ? 0 : packScore(width, height, shelves.slack, options);
    // P-4: lower score wins; equal scores keep the wider candidate; a further
    // tie keeps the smaller prefix index (the one met first).
    if (
      best === undefined ||
      score < best.score - PACK_SCORE_EPSILON ||
      (Math.abs(score - best.score) <= PACK_SCORE_EPSILON && width > best.width)
    ) {
      best = { shelves, score, width };
    }
  }
  const chosen = best!.shelves;
  const positions: PackPosition[] = new Array<PackPosition>(count);
  let crossCursor = 0;
  chosen.shelves.forEach((shelf, shelfIndex) => {
    let alongCursor = 0;
    let thickness = 0;
    shelf.forEach((boxIndex, slot) => {
      // P-7: every box sits on the shelf start (top-aligned rows, left-aligned columns).
      positions[boxIndex] = rows
        ? { x: alongCursor, y: crossCursor, row: shelfIndex, col: slot }
        : { x: crossCursor, y: alongCursor, row: shelfIndex, col: slot };
      alongCursor += along[boxIndex]! + gapAlong;
      thickness = Math.max(thickness, across[boxIndex]!);
    });
    crossCursor += thickness + gapAcross;
  });
  return {
    width: rows ? chosen.main : chosen.cross,
    height: rows ? chosen.cross : chosen.main,
    rows: chosen.shelves,
    positions,
    score: best!.score,
  };
}

/** Rows form: shelves run horizontally, boxes fill left-to-right and wrap downward. */
export function packRows(boxes: readonly PackBox[], options: PackOptions): PackResult {
  return pack(boxes, options, "rows");
}

/** Columns form (P-8): the exact transpose — shelves run vertically and wrap rightward. */
export function packColumns(boxes: readonly PackBox[], options: PackOptions): PackResult {
  return pack(boxes, options, "columns");
}

export interface OrientationChoice {
  readonly orientation: PackOrientation;
  readonly result: PackResult;
  readonly scoreRows: number;
  readonly scoreColumns: number;
}

/**
 * O-1–O-4: score both forms on the total P-3 score and keep the lower one;
 * equal scores keep `rows`; a previous orientation is kept while the two
 * scores are closer than `hysteresis`. A level of zero or one box is `rows`.
 */
export function chooseOrientation(
  boxes: readonly PackBox[],
  options: PackOptions,
  hysteresis: number,
  previous?: PackOrientation,
): OrientationChoice {
  const rows = packRows(boxes, options);
  if (boxes.length <= 1) return { orientation: "rows", result: rows, scoreRows: rows.score, scoreColumns: rows.score };
  const columns = packColumns(boxes, options);
  const gap = Math.abs(rows.score - columns.score);
  let orientation: PackOrientation;
  if (previous !== undefined && gap < hysteresis) orientation = previous;
  else if (gap <= PACK_SCORE_EPSILON) orientation = "rows";
  else orientation = rows.score < columns.score ? "rows" : "columns";
  return {
    orientation,
    result: orientation === "rows" ? rows : columns,
    scoreRows: rows.score,
    scoreColumns: columns.score,
  };
}
