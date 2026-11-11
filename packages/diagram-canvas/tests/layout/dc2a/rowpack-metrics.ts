/**
 * DC-2a placement metrics (SPEC_EVOL_DC2A §7): pure functions over emitted
 * rectangles, routes and label boxes. Test-only; never shipped in `src/`.
 *
 * Frame metrics use the harness viewport (1440 × 810, 16:9) and the maximum
 * display scale proxy (0.62): `displayScale = min(W / bboxW, H / bboxH, 0.62)`.
 */
import type { Rect, Vec2 } from "../../../src/index.js";
import { FRAME, type SceneLayout } from "./scenes.js";

export const TARGET_ASPECT = 1.78;
export const MAX_DISPLAY_SCALE = 0.62;
/** Base sibling gap token (24 px) and the tolerance of every gap probe (0.5 px). */
export const BASE_GAP = 24;
export const GAP_TOLERANCE = 0.5;

export interface GapStats {
  readonly count: number;
  readonly min: number;
  readonly max: number;
  readonly mean: number;
}

export interface SiblingGap {
  readonly level: string;
  readonly axis: "x" | "y";
  readonly before: string;
  readonly after: string;
  readonly gap: number;
  /** True when a routed edge or a label box crosses the gutter between the pair. */
  readonly crossed: boolean;
}

export interface PlacementMetrics {
  readonly visible: number;
  readonly visibleLeaves: number;
  readonly bboxWidth: number;
  readonly bboxHeight: number;
  /** Entity bbox width / height. */
  readonly aspectRatio: number;
  /** |ln(aspectRatio / 1.78)|. */
  readonly logAspectError: number;
  /** Visible-leaf areas / entity bbox area (DEC-7). */
  readonly fillRatio: number;
  /** Fit-scaled entity bbox area / frame area. */
  readonly frameFillRatio: number;
  readonly displayScale: number;
  readonly gapX: GapStats;
  readonly gapY: GapStats;
  /** Gutters wider than the base gap that no routed edge and no label box crosses. */
  readonly emptyLanes: number;
  /** Levels of two siblings or more stacked in one single column. */
  readonly singleColumnLevels: number;
  readonly sceneBandX: number;
  readonly sceneBandY: number;
  /** Routes leaving the rectangle of the lowest expanded container shared by their two ends. */
  readonly edgesOutsideContainer: number;
  readonly labelCardOverlaps: number;
  readonly labelUnplaced: number;
}

const round = (value: number): number => Math.round(value * 1000) / 1000;

const stats = (values: readonly number[]): GapStats =>
  values.length === 0
    ? { count: 0, min: 0, max: 0, mean: 0 }
    : {
        count: values.length,
        min: round(Math.min(...values)),
        max: round(Math.max(...values)),
        mean: round(values.reduce((sum, value) => sum + value, 0) / values.length),
      };

const intersects = (left: Rect, right: Rect, tolerance = GAP_TOLERANCE): boolean =>
  left.x < right.x + right.width - tolerance &&
  right.x < left.x + left.width - tolerance &&
  left.y < right.y + right.height - tolerance &&
  right.y < left.y + left.height - tolerance;

function segmentCrosses(a: Vec2, b: Vec2, rect: Rect): boolean {
  const box: Rect = {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(b.x - a.x),
    height: Math.abs(b.y - a.y),
  };
  // A segment is a degenerate box: test with closed bounds on its thin axis.
  return (
    box.x <= rect.x + rect.width &&
    rect.x <= box.x + box.width &&
    box.y <= rect.y + rect.height &&
    rect.y <= box.y + box.height
  );
}

/** Adjacent sibling pairs of every level with their clear gap and crossing flag. */
export function siblingGaps(layout: SceneLayout): SiblingGap[] {
  const levels = new Map<string, string[]>();
  for (const [id, parent] of layout.parentOf) {
    const key = parent ?? "root";
    const list = levels.get(key) ?? [];
    list.push(id);
    levels.set(key, list);
  }
  const crossed = (gutter: Rect): boolean =>
    layout.routes.some((route) =>
      route.points.slice(1).some((point, index) => segmentCrosses(route.points[index]!, point, gutter)),
    ) || [...layout.labelBoxes.values()].some((box) => intersects(box, gutter, 0));
  // Gaps are read shelf by shelf (§3.5, P-7): a shelf is the set of siblings
  // sharing one start edge across the level's orientation (rows: one top;
  // columns: one left). The along-shelf gap separates two neighbours of one
  // shelf; the across gap separates two successive shelves, measured from the
  // far edge of the thickest box of the first. Shelf slack (a short box next
  // to a tall one) is never a sibling gap. The column placement of the
  // baseline is a rows level with one box per shelf.
  const out: SiblingGap[] = [];
  for (const [level, members] of [...levels].sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))) {
    const key = level === "root" ? "root" : `occurrence:e.${level}`;
    const rows = layout.orientations[key] !== "columns";
    const along = (rect: Rect): [number, number] => (rows ? [rect.x, rect.x + rect.width] : [rect.y, rect.y + rect.height]);
    const across = (rect: Rect): [number, number] => (rows ? [rect.y, rect.y + rect.height] : [rect.x, rect.x + rect.width]);
    const gutterOf = (alongRange: [number, number], acrossRange: [number, number]): Rect =>
      rows
        ? { x: alongRange[0], y: acrossRange[0], width: alongRange[1] - alongRange[0], height: acrossRange[1] - acrossRange[0] }
        : { x: acrossRange[0], y: alongRange[0], width: acrossRange[1] - acrossRange[0], height: alongRange[1] - alongRange[0] };
    const shelves: { start: number; end: number; ids: string[] }[] = [];
    for (const id of [...members].sort((left, right) => across(layout.rects.get(left)!)[0] - across(layout.rects.get(right)!)[0])) {
      const [start, end] = across(layout.rects.get(id)!);
      const shelf = shelves.find((candidate) => Math.abs(candidate.start - start) <= GAP_TOLERANCE);
      if (shelf === undefined) shelves.push({ start, end, ids: [id] });
      else {
        shelf.end = Math.max(shelf.end, end);
        shelf.ids.push(id);
      }
    }
    const alongAxis = rows ? "x" : "y";
    const acrossAxis = rows ? "y" : "x";
    shelves.forEach((shelf, index) => {
      const ordered = [...shelf.ids].sort((left, right) => along(layout.rects.get(left)!)[0] - along(layout.rects.get(right)!)[0]);
      ordered.slice(1).forEach((after, slot) => {
        const before = ordered[slot]!;
        const a = layout.rects.get(before)!;
        const b = layout.rects.get(after)!;
        const band: [number, number] = [shelf.start, Math.min(across(a)[1], across(b)[1])];
        const gutter = gutterOf([along(a)[1], along(b)[0]], band);
        out.push({ level, axis: alongAxis, before, after, gap: round(along(b)[0] - along(a)[1]), crossed: crossed(gutter) });
      });
      const next = shelves[index + 1];
      if (next === undefined) return;
      const extent = [...shelf.ids, ...next.ids].map((id) => along(layout.rects.get(id)!));
      const span: [number, number] = [Math.min(...extent.map((range) => range[0])), Math.max(...extent.map((range) => range[1]))];
      const gutter = gutterOf(span, [shelf.end, next.start]);
      out.push({
        level,
        axis: acrossAxis,
        before: ordered[0]!,
        after: next.ids[0]!,
        gap: round(next.start - shelf.end),
        crossed: crossed(gutter),
      });
    });
  }
  return out;
}

/** §7.1 scene band: largest uncovered interval of the axis projection of entity and label boxes. */
function sceneBand(boxes: readonly Rect[], axis: "x" | "y"): number {
  const intervals = boxes
    .map((box) => (axis === "x" ? [box.x, box.x + box.width] : [box.y, box.y + box.height]) as [number, number])
    .sort((left, right) => left[0] - right[0]);
  let band = 0;
  let end = intervals[0]?.[1] ?? 0;
  for (const [from, to] of intervals) {
    if (from > end) band = Math.max(band, from - end);
    end = Math.max(end, to);
  }
  return round(band);
}

export function placementMetrics(layout: SceneLayout): PlacementMetrics {
  const rects = [...layout.rects.values()];
  const xmin = Math.min(...rects.map((rect) => rect.x));
  const ymin = Math.min(...rects.map((rect) => rect.y));
  const xmax = Math.max(...rects.map((rect) => rect.x + rect.width));
  const ymax = Math.max(...rects.map((rect) => rect.y + rect.height));
  const bbox: Rect = { x: xmin, y: ymin, width: xmax - xmin, height: ymax - ymin };
  const leaves = layout.input.leaves.map((id) => layout.rects.get(id)!);
  const leafArea = leaves.reduce((sum, rect) => sum + rect.width * rect.height, 0);
  const scale = Math.min(FRAME.width / bbox.width, FRAME.height / bbox.height, MAX_DISPLAY_SCALE);
  const gaps = siblingGaps(layout);
  const levels = new Map<string, Rect[]>();
  for (const [id, parent] of layout.parentOf) {
    const list = levels.get(parent ?? "root") ?? [];
    list.push(layout.rects.get(id)!);
    levels.set(parent ?? "root", list);
  }
  let singleColumnLevels = 0;
  for (const members of levels.values()) {
    if (members.length >= 2 && members.every((rect) => Math.abs(rect.x - members[0]!.x) <= GAP_TOLERANCE)) {
      singleColumnLevels += 1;
    }
  }
  const ancestorsOf = (id: string): string[] => {
    const chain: string[] = [];
    for (let parent = layout.parentOf.get(id); parent !== undefined; parent = layout.parentOf.get(parent)) chain.push(parent);
    return chain;
  };
  let edgesOutsideContainer = 0;
  for (const route of layout.routes) {
    const targetChain = new Set(ancestorsOf(route.target));
    const shared = ancestorsOf(route.source).find((ancestor) => targetChain.has(ancestor));
    const bound = shared === undefined ? bbox : layout.rects.get(shared)!;
    const outside = route.points.some(
      (point) =>
        point.x < bound.x - GAP_TOLERANCE ||
        point.x > bound.x + bound.width + GAP_TOLERANCE ||
        point.y < bound.y - GAP_TOLERANCE ||
        point.y > bound.y + bound.height + GAP_TOLERANCE,
    );
    if (outside) edgesOutsideContainer += 1;
  }
  const labels = [...layout.labelBoxes.values()];
  return {
    visible: layout.rects.size,
    visibleLeaves: leaves.length,
    bboxWidth: round(bbox.width),
    bboxHeight: round(bbox.height),
    aspectRatio: round(bbox.width / bbox.height),
    logAspectError: round(Math.abs(Math.log(bbox.width / bbox.height / TARGET_ASPECT))),
    fillRatio: round(leafArea / (bbox.width * bbox.height)),
    frameFillRatio: round((bbox.width * scale * bbox.height * scale) / (FRAME.width * FRAME.height)),
    displayScale: round(scale),
    gapX: stats(gaps.filter((gap) => gap.axis === "x").map((gap) => gap.gap)),
    gapY: stats(gaps.filter((gap) => gap.axis === "y").map((gap) => gap.gap)),
    emptyLanes: gaps.filter((gap) => gap.gap > BASE_GAP + GAP_TOLERANCE && !gap.crossed).length,
    singleColumnLevels,
    sceneBandX: sceneBand([...rects, ...labels], "x"),
    sceneBandY: sceneBand([...rects, ...labels], "y"),
    edgesOutsideContainer,
    labelCardOverlaps: labels.filter((box) => leaves.some((leaf) => intersects(box, leaf))).length,
    labelUnplaced: layout.warnings.filter((warning) => warning.code === "label-unplaced").length,
  };
}
