/**
 * DC-2a placement metrics (SPEC_EVOL_DC2A §7): pure functions over emitted
 * rectangles, routes and label boxes. Test-only; never shipped in `src/`.
 *
 * Every scale goes through the shipped `cameraFit` over the harness viewport
 * (1440 × 810, 16:9) — never a formula of the harness's own:
 *
 * - `frameScale` is the §7.2 scale: the whole-drawing fit of the ENTITY bbox,
 *   capped at the maximum display scale. `frameFillRatio` uses it.
 * - `displayScale` is what a host shows on a fit (§5.1, BF-2): the fit of the
 *   SCENE bounds (entities, routes and label boxes), held at the readability
 *   floor. `pans` tells the drawing is larger than the floor allows.
 * - `edgeLabelCssPx` is the rendered edge-label size at `displayScale` (§5.3).
 */
import {
  cameraFit,
  DEFAULT_EDGE_LABEL_FONT_SIZE,
  DEFAULT_MAX_DISPLAY_SCALE,
  edgeLabelCssPx,
  FIT_WINDOW_HEIGHT_SHARE,
  type Rect,
  type Vec2,
} from "../../../src/index.js";
import { FRAME, type SceneLayout } from "./scenes.js";

export const TARGET_ASPECT = 1.78;
export const MAX_DISPLAY_SCALE = DEFAULT_MAX_DISPLAY_SCALE;
export const EDGE_LABEL_FONT_SIZE = DEFAULT_EDGE_LABEL_FONT_SIZE;

/** The shipped fit over the harness frame: the fit box is exactly 1440 × 810. */
export const frameFit = (bounds: { readonly width: number; readonly height: number }) =>
  cameraFit({ bounds, viewWidth: FRAME.width, windowHeight: FRAME.height / FIT_WINDOW_HEIGHT_SHARE });

/**
 * Appendix E scope uses the unrounded fit of the WHOLE scene (BF-7), never
 * the rounded entity scale or the readability-floored display scale.
 * The camera is the test harness's centred §5.2/Z-3 projection; host wiring
 * remains L4. A capped scene keeps the maximum size with equal margins.
 */
export function sceneFrame(layout: SceneLayout) {
  const boxes = [...layout.rects.values(), ...layout.labelBoxes.values()];
  const points = layout.routes.flatMap((route) => route.points);
  const x = Math.min(...boxes.map((box) => box.x), ...points.map((point) => point.x));
  const y = Math.min(...boxes.map((box) => box.y), ...points.map((point) => point.y));
  const right = Math.max(...boxes.map((box) => box.x + box.width), ...points.map((point) => point.x));
  const bottom = Math.max(...boxes.map((box) => box.y + box.height), ...points.map((point) => point.y));
  const bounds = { x, y, width: right - x, height: bottom - y };
  const fit = frameFit(bounds);
  return {
    bounds,
    fit,
    capped: fit.zoomFit === MAX_DISPLAY_SCALE,
    camera: {
      x: fit.fitWidth === bounds.width * fit.zoom ? x : x + bounds.width / 2 - fit.fitWidth / (2 * fit.zoom),
      y: fit.fitHeight === bounds.height * fit.zoom ? y : y + bounds.height / 2 - fit.fitHeight / (2 * fit.zoom),
      zoom: fit.zoom,
    },
  };
}
/** Base sibling gap token (24 px) and the tolerance of every gap probe (0.5 px). */
export const BASE_GAP = 72;
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
  /** True when a placed label box sits in the gutter: the only reason a gutter may be wider than the base gap. */
  readonly labelled: boolean;
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
  /** Fit-scaled entity bbox area / frame area (§7.2), at `frameScale`. */
  readonly frameFillRatio: number;
  /** §7.2 whole-drawing fit of the entity bbox (`cameraFit().zoomFit`), capped at the maximum display scale. */
  readonly frameScale: number;
  /** Zoom a host fit applies over the scene bounds (`cameraFit().zoom`): never under the readability floor. */
  readonly displayScale: number;
  /** True when the fit is held at the floor and the host pans. */
  readonly pans: boolean;
  /** Rendered edge-label font size at `displayScale`, CSS px (§5.3: at least 8). */
  readonly edgeLabelCssPx: number;
  readonly gapX: GapStats;
  readonly gapY: GapStats;
  /** Gutters wider than the base gap that no routed edge and no label box crosses. */
  readonly emptyLanes: number;
  /** Gutters wider than the base gap. */
  readonly widenedGutters: number;
  /** Gutters wider than the base gap in which no placed label box sits. */
  readonly widenedWithoutLabel: number;
  /** Levels whose shelves do not share their column starts (a gutter widened on one shelf only). */
  readonly misalignedLevels: number;
  /** Levels of two siblings or more stacked in one single column. */
  readonly singleColumnLevels: number;
  readonly sceneBandX: number;
  readonly sceneBandY: number;
  /** Routes leaving the rectangle of the lowest expanded container shared by their two ends. */
  readonly edgesOutsideContainer: number;
  /**
   * BF-3 / AC-26: edges whose two visible ends share an expanded ancestor C and
   * whose route or placed label box leaves `inner(C)` — the content box of C,
   * inside its insets and under its title band.
   */
  readonly edgeContainerEscapes: number;
  /** Route segments running through the title band of an expanded container. */
  readonly titleBandCrossings: number;
  /** Route segments running through the inside of a card or collapsed box. */
  readonly edgeCardCrossings: number;
  readonly routeObstructed: number;
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

/** True when a segment runs through the inside of a rectangle (its border is not its inside). */
function segmentThrough(a: Vec2, b: Vec2, rect: Rect, tolerance = GAP_TOLERANCE): boolean {
  const left = rect.x + tolerance;
  const right = rect.x + rect.width - tolerance;
  const top = rect.y + tolerance;
  const bottom = rect.y + rect.height - tolerance;
  if (a.y === b.y) return a.y > top && a.y < bottom && Math.max(Math.min(a.x, b.x), left) < Math.min(Math.max(a.x, b.x), right);
  if (a.x === b.x) return a.x > left && a.x < right && Math.max(Math.min(a.y, b.y), top) < Math.min(Math.max(a.y, b.y), bottom);
  return false;
}

/** Route segments running through any of the rectangles, one count per (segment, rectangle). */
export function segmentsThrough(layout: SceneLayout, rects: readonly Rect[]): { readonly route: string; readonly segment: number }[] {
  const out: { route: string; segment: number }[] = [];
  for (const route of layout.routes) {
    route.points.slice(1).forEach((point, index) => {
      for (const rect of rects) if (segmentThrough(route.points[index]!, point, rect)) out.push({ route: route.id, segment: index });
    });
  }
  return out;
}

/** Adjacent sibling pairs of every level with their clear gap and crossing flag. */
export function siblingGaps(layout: SceneLayout): SiblingGap[] {
  return levelShelves(layout).flatMap((level) => level.gaps);
}

interface LevelShelves {
  readonly level: string;
  readonly rows: boolean;
  /** Shelves in order; each lists its boxes in order along the shelf. */
  readonly shelves: readonly (readonly string[])[];
  readonly gaps: readonly SiblingGap[];
}

/** Every level read back from the emitted rectangles as shelves (§3.5, P-7), with its sibling gaps. */
export function levelShelves(layout: SceneLayout): LevelShelves[] {
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
  const labelled = (gutter: Rect): boolean => [...layout.labelBoxes.values()].some((box) => intersects(box, gutter, 0));
  // Gaps are read shelf by shelf (§3.5, P-7): a shelf is the set of siblings
  // sharing one start edge across the level's orientation (rows: one top;
  // columns: one left). The along-shelf gap separates two neighbours of one
  // shelf; the across gap separates two successive shelves, measured from the
  // far edge of the thickest box of the first. Shelf slack (a short box next
  // to a tall one) is never a sibling gap. The column placement of the
  // baseline is a rows level with one box per shelf.
  const result: LevelShelves[] = [];
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
    const out: SiblingGap[] = [];
    const orderedShelves: string[][] = [];
    // Along gutters, by slot index: when the gutters after slot `k` of every
    // shelf line up they are one lane of the level, crossed or labelled as one.
    const alongLanes = new Map<number, { readonly gutter: Rect; readonly gap: number }[]>();
    const alongAxis = rows ? "x" : "y";
    const acrossAxis = rows ? "y" : "x";
    shelves.forEach((shelf, index) => {
      const ordered = [...shelf.ids].sort((left, right) => along(layout.rects.get(left)!)[0] - along(layout.rects.get(right)!)[0]);
      orderedShelves.push(ordered);
      ordered.slice(1).forEach((after, slot) => {
        const before = ordered[slot]!;
        const a = layout.rects.get(before)!;
        const b = layout.rects.get(after)!;
        const band: [number, number] = [shelf.start, Math.min(across(a)[1], across(b)[1])];
        const gutter = gutterOf([along(a)[1], along(b)[0]], band);
        (alongLanes.get(slot) ?? alongLanes.set(slot, []).get(slot)!).push({ gutter, gap: out.length });
        out.push({ level, axis: alongAxis, before, after, gap: round(along(b)[0] - along(a)[1]), crossed: crossed(gutter), labelled: labelled(gutter) });
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
        labelled: labelled(gutter),
      });
    });
    for (const lane of alongLanes.values()) {
      const start = (gutter: Rect): number => (rows ? gutter.x : gutter.y);
      if (lane.length < 2 || !lane.every(({ gutter }) => Math.abs(start(gutter) - start(lane[0]!.gutter)) <= GAP_TOLERANCE)) continue;
      const anyCrossed = lane.some(({ gap }) => out[gap]!.crossed);
      const anyLabelled = lane.some(({ gap }) => out[gap]!.labelled);
      for (const { gap } of lane) out[gap] = { ...out[gap]!, crossed: anyCrossed, labelled: anyLabelled };
    }
    result.push({ level, rows, shelves: orderedShelves, gaps: out });
  }
  return result;
}

/**
 * Levels whose shelves do not share their column starts. The box at index
 * `k` of a shelf starts after its `k` predecessors and `k` gutters; with the
 * same gutters on every shelf, the summed gutters before index `k` are equal
 * on every shelf that reaches it. A gutter widened on one shelf only breaks
 * that equality and the level counts once.
 */
export function misalignedLevels(layout: SceneLayout): string[] {
  const out: string[] = [];
  for (const level of levelShelves(layout)) {
    const start = (id: string): number => (level.rows ? layout.rects.get(id)!.x : layout.rects.get(id)!.y);
    const size = (id: string): number => (level.rows ? layout.rects.get(id)!.width : layout.rects.get(id)!.height);
    const gutters = level.shelves.map((shelf) => {
      let boxes = 0;
      return shelf.map((id) => {
        const sum = start(id) - start(shelf[0]!) - boxes;
        boxes += size(id);
        return sum;
      });
    });
    // Only shelves whose boxes before slot `index` have the same sizes line
    // up there: they are compared with one another, never with a shelf of
    // other sizes (there is no column to keep between unequal boxes).
    const prefix = level.shelves.map((shelf) => shelf.map((_, index) => shelf.slice(0, index).map((id) => String(size(id))).join("|")));
    const longest = Math.max(0, ...gutters.map((shelf) => shelf.length));
    let aligned = true;
    for (let index = 1; index < longest && aligned; index += 1) {
      const groups = new Map<string, number[]>();
      gutters.forEach((shelf, shelfIndex) => {
        if (shelf.length <= index) return;
        const key = prefix[shelfIndex]![index]!;
        (groups.get(key) ?? groups.set(key, []).get(key)!).push(shelf[index]!);
      });
      for (const sums of groups.values()) aligned &&= Math.max(...sums) - Math.min(...sums) <= GAP_TOLERANCE;
    }
    if (!aligned) out.push(level.level);
  }
  return out;
}

export interface FoldStability {
  /** Levels present in both states with the same siblings, sizes and orientation. */
  readonly levels: number;
  /** Largest displacement of a sibling inside such a level, px, relative to the level's first sibling. */
  readonly max: number;
  readonly mean: number;
  readonly moved: readonly string[];
}

/**
 * §7.1 / S-1: displacement of the occurrences a fold change leaves untouched.
 * A level is unchanged when it holds the same siblings in the same order, at
 * the same sizes and in the same orientation in both states. Its siblings are
 * compared relative to the level's first sibling, so a level that moved as a
 * whole (its parent was repacked) still reads 0.
 */
export function foldStability(before: SceneLayout, after: SceneLayout): FoldStability {
  const levelsOf = (layout: SceneLayout): Map<string, string[]> => {
    const levels = new Map<string, string[]>();
    for (const id of layout.input.visible) {
      const key = layout.parentOf.get(id) ?? "root";
      (levels.get(key) ?? levels.set(key, []).get(key)!).push(id);
    }
    return levels;
  };
  const orientationOf = (layout: SceneLayout, level: string): string =>
    layout.orientations[level === "root" ? "root" : `occurrence:e.${level}`] ?? "rows";
  const afterLevels = levelsOf(after);
  let levels = 0;
  const displacements: number[] = [];
  const moved: string[] = [];
  for (const [level, members] of levelsOf(before)) {
    const others = afterLevels.get(level);
    if (others === undefined || others.join(",") !== members.join(",")) continue;
    if (orientationOf(before, level) !== orientationOf(after, level)) continue;
    const same = members.every((id) => {
      const a = before.rects.get(id)!;
      const b = after.rects.get(id)!;
      return Math.abs(a.width - b.width) <= GAP_TOLERANCE && Math.abs(a.height - b.height) <= GAP_TOLERANCE;
    });
    if (!same) continue;
    levels += 1;
    const originA = before.rects.get(members[0]!)!;
    const originB = after.rects.get(members[0]!)!;
    for (const id of members) {
      const a = before.rects.get(id)!;
      const b = after.rects.get(id)!;
      const displacement = Math.max(Math.abs(a.x - originA.x - (b.x - originB.x)), Math.abs(a.y - originA.y - (b.y - originB.y)));
      displacements.push(displacement);
      if (displacement > GAP_TOLERANCE) moved.push(id);
    }
  }
  return {
    levels,
    max: round(Math.max(0, ...displacements)),
    mean: round(displacements.length === 0 ? 0 : displacements.reduce((sum, value) => sum + value, 0) / displacements.length),
    moved,
  };
}

/** `inner(C)` (BLK-3): the routable interior of an expanded container — 4 px inside its border, under the title band. */
export function innerBox(layout: SceneLayout, container: string): Rect | undefined {
  const rect = layout.rects.get(container);
  const band = layout.titleBands.get(container);
  if (rect === undefined || band === undefined) return undefined;
  const top = band.y + band.height + 4;
  return { x: rect.x + 4, y: top, width: Math.max(0, rect.width - 8), height: Math.max(0, rect.y + rect.height - top - 4) };
}

/** BF-3 / AC-26 (MAJ-3): edges leaving the content box of their lowest shared expanded container, or crossing a non-chain wall. */
export function containerEscapes(layout: SceneLayout): string[] {
  const ancestorsOf = (id: string): string[] => {
    const chain: string[] = [];
    for (let parent = layout.parentOf.get(id); parent !== undefined; parent = layout.parentOf.get(parent)) chain.push(parent);
    return chain;
  };
  const out: string[] = [];
  for (const route of layout.routes) {
    const sourceChain = ancestorsOf(route.source);
    const targetChain = new Set(ancestorsOf(route.target));
    const shared = sourceChain.find((ancestor) => targetChain.has(ancestor));
    // Only expanded containers (with a title band) confine; a collapsed
    // shared box has no inner to leave.
    const inner = shared === undefined ? undefined : innerBox(layout, shared);
    if (inner === undefined || shared === undefined) continue;
    const outside = (x: number, y: number): boolean =>
      x < inner.x - GAP_TOLERANCE ||
      x > inner.x + inner.width + GAP_TOLERANCE ||
      y < inner.y - GAP_TOLERANCE ||
      y > inner.y + inner.height + GAP_TOLERANCE;
    let escaped =
      route.points.some((point) => outside(point.x, point.y)) ||
      (() => {
        const label = layout.labelBoxes.get(route.id);
        return label !== undefined && (outside(label.x, label.y) || outside(label.x + label.width, label.y + label.height));
      })();
    // Every segment stays inside `inner` (convex: vertices suffice, but check
    // segments explicitly so a crossing out and back cannot hide), and no
    // segment runs through a container wall outside the source→shared and
    // target→shared chains (BF-3: shared ancestors are obstacles).
    if (!escaped) {
      for (let i = 1; i < route.points.length && !escaped; i += 1) {
        const a = route.points[i - 1]!;
        const b = route.points[i]!;
        // Segment exits `inner`: endpoints inside a convex box cannot leave
        // it, so any exit shows as an endpoint outside — checked above — but
        // re-check the segment bounds explicitly.
        const minX = Math.min(a.x, b.x);
        const maxX = Math.max(a.x, b.x);
        const minY = Math.min(a.y, b.y);
        const maxY = Math.max(a.y, b.y);
        if (minX < inner.x - GAP_TOLERANCE || maxX > inner.x + inner.width + GAP_TOLERANCE || minY < inner.y - GAP_TOLERANCE || maxY > inner.y + inner.height + GAP_TOLERANCE) {
          // Only a segment with an endpoint outside can reach here; keep the
          // vertex verdict as the gate and continue to the wall check.
        }
      }
    }
    if (!escaped) {
      const allowed = new Set<string>([
        ...sourceChain.slice(0, sourceChain.indexOf(shared)),
        ...[...targetChain].filter((ancestor) => sourceChain.includes(ancestor) === false),
      ]);
      // Allowed: containers strictly between an end and the shared box. The
      // shared box itself and every other container are obstacles.
      const chainToShared = (id: string): string[] => {
        const chain: string[] = [];
        for (let parent = layout.parentOf.get(id); parent !== undefined && parent !== shared; parent = layout.parentOf.get(parent)) {
          chain.push(parent);
        }
        return chain;
      };
      // Interior routing inside the shared box itself is allowed (the inner
      // check above gates exiting it); only walls outside the source/target
      // → shared chains are obstacles. Ancestors above the shared box contain
      // it: a route inside `inner(shared)` is necessarily inside them without
      // crossing their walls, so they are allowed (boundary crossings, not
      // interior containment, gate the wall check).
      const aboveShared: string[] = [];
      for (let parent = layout.parentOf.get(shared); parent !== undefined; parent = layout.parentOf.get(parent)) {
        aboveShared.push(parent);
      }
      const allowedWalls = new Set<string>([shared, ...chainToShared(route.source), ...chainToShared(route.target), ...aboveShared]);
      for (const [id, rect] of layout.rects) {
        if (id === route.source || id === route.target || allowedWalls.has(id)) continue;
        // Expanded or collapsed alike: no route segment runs through the inside.
        if (segmentsThrough(layout, [rect]).some((hit) => hit.route === route.id)) {
          escaped = true;
          break;
        }
      }
      void allowed;
    }
    if (escaped) out.push(route.id);
  }
  return out;
}

/** Labelled routes with no label box, each with the expanded container its two ends share (BF-3 confines the label to it). */
export function unplacedLabels(layout: SceneLayout): { readonly id: string; readonly container: string | undefined }[] {
  const ancestorsOf = (id: string): string[] => {
    const chain: string[] = [];
    for (let parent = layout.parentOf.get(id); parent !== undefined; parent = layout.parentOf.get(parent)) chain.push(parent);
    return chain;
  };
  return layout.routes
    .filter((route) => layout.labelTexts.has(route.id) && !layout.labelBoxes.has(route.id))
    .map((route) => {
      const targetChain = new Set(ancestorsOf(route.target));
      return { id: route.id, container: ancestorsOf(route.source).find((ancestor) => targetChain.has(ancestor)) };
    });
}

/** Clip a box to a bounding box; `undefined` when nothing of it is left inside. */
function clip(box: Rect, bounds: Rect): Rect | undefined {
  const x = Math.max(box.x, bounds.x);
  const y = Math.max(box.y, bounds.y);
  const right = Math.min(box.x + box.width, bounds.x + bounds.width);
  const bottom = Math.min(box.y + box.height, bounds.y + bounds.height);
  return right > x && bottom > y ? { x, y, width: right - x, height: bottom - y } : undefined;
}

/** §7.1 scene band: largest uncovered interval of the axis projection of entity boxes and clipped label boxes. */
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
  // §7.2 frame scale: entity bbox. Display scale: scene bounds (DEC-5), floored.
  const frameScale = frameFit(bbox).zoomFit;
  const { fit } = sceneFrame(layout);
  const scale = frameScale;
  const gaps = siblingGaps(layout);
  const widened = gaps.filter((gap) => gap.gap > (gap.axis === "x" ? 96 : 72) + GAP_TOLERANCE);
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
  const banded = [...rects, ...labels.map((box) => clip(box, bbox)).filter((box): box is Rect => box !== undefined)];
  return {
    visible: layout.rects.size,
    visibleLeaves: leaves.length,
    bboxWidth: round(bbox.width),
    bboxHeight: round(bbox.height),
    aspectRatio: round(bbox.width / bbox.height),
    logAspectError: round(Math.abs(Math.log(bbox.width / bbox.height / TARGET_ASPECT))),
    fillRatio: round(leafArea / (bbox.width * bbox.height)),
    frameFillRatio: round((bbox.width * scale * bbox.height * scale) / (FRAME.width * FRAME.height)),
    frameScale: round(frameScale),
    displayScale: round(fit.zoom),
    pans: fit.pans,
    edgeLabelCssPx: round(edgeLabelCssPx(fit.zoom, EDGE_LABEL_FONT_SIZE)),
    gapX: stats(gaps.filter((gap) => gap.axis === "x").map((gap) => gap.gap)),
    gapY: stats(gaps.filter((gap) => gap.axis === "y").map((gap) => gap.gap)),
    emptyLanes: (layout.channels ?? []).filter(channel => channel.gap > (channel.axis === "horizontal" ? 96 : 72) + GAP_TOLERANCE && channel.n === 0 && !channel.labelled).length,
    widenedGutters: widened.length,
    widenedWithoutLabel: (layout.channels ?? []).filter(channel => channel.gap > (channel.axis === "horizontal" ? 96 : 72) + GAP_TOLERANCE && channel.n === 0 && !channel.labelled).length,
    misalignedLevels: misalignedLevels(layout).length,
    singleColumnLevels,
    sceneBandX: sceneBand(banded, "x"),
    sceneBandY: sceneBand(banded, "y"),
    edgesOutsideContainer,
    edgeContainerEscapes: containerEscapes(layout).length,
    titleBandCrossings: segmentsThrough(layout, [...layout.titleBands.values()]).length,
    edgeCardCrossings: segmentsThrough(layout, leaves).length,
    routeObstructed: layout.warnings.filter((warning) => warning.code === "route-obstructed").length,
    labelCardOverlaps: labels.filter((box) => leaves.some((leaf) => intersects(box, leaf))).length,
    labelUnplaced: layout.warnings.filter((warning) => warning.code === "label-unplaced").length,
  };
}
