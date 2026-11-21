/**
 * Fold-aware nominal composition plan, fold-neutral view normalization,
 * derived plan cache key, subtree memo (D-6), and painted-gap audit (F-6).
 *
 * Implements H2-STEP0 §4.2 (S-1 / S-2), §4.4 (F-1…F-6), and §4.5 (D-1…D-6).
 * Pure geometry and hashing: no DOM, no randomness, no timers.
 */
import {
  canonicalise,
  foldGroupId,
  tryCanonicalise,
  type EntityRef,
  type OccurrenceRef,
  type RelationOccurrence,
  type SemanticDocument,
  type ViewDocument,
  type VisualGroup,
} from "@sentropic/diagram-core";

import { DEFAULT_EDGE_LABEL_SIZE } from "../camera.js";
import { measureLegendProbe } from "../presentation/linkLegend.js";
import { isR7ConnectorPresentation } from "../r7Mode.js";
import type { Rect } from "../transform.js";
import type { ComposedGridReport, ComposedPaintedGap, GridLayoutResult, StackLayoutResult } from "./compose.js";
import { digestOf, layoutFingerprint } from "./fingerprint.js";
import { DEFAULT_ALLOCATED_LINES, type EntityMeasurementInput, type HeaderMeasurement } from "./measure.js";
import { DEFAULT_LAYOUT_METRICS, type LayoutOptions, type LevelOrientation, type TextRole } from "./types.js";

const byString = (left: string, right: string): number => (left < right ? -1 : left > right ? 1 : 0);
const clean = (value: number): number => (value === 0 ? 0 : value);

export interface FrozenAutoPackLevel {
  readonly orientation: LevelOrientation;
  /** Shelf membership frozen by child entity ref (never slot index), §4.2 S-1 step 7. */
  readonly shelves: readonly (readonly EntityRef[])[];
}

export interface NominalCompositionPlan {
  readonly planDigest: string;
  /** Auto-pack target aspect chosen at nominal (`1.78` for `"free"`, ladder choice in H2.6 for `"16:9"`). */
  readonly tau: number;
  /** Frozen orientation and shelf membership (by EntityRef) for every auto-packed container. */
  readonly autoPackLevels: Readonly<Record<string, FrozenAutoPackLevel>>;
  /** Label/channel widenings frozen for inner gutters (every level below `"root"`), S-1 step 6. */
  readonly innerWiden: Readonly<Record<string, number>>;
  /** Frozen root x-track slack σ (H2.6, 16:9 only; empty when `"free"`). */
  readonly sigmaCols: Readonly<Record<string, number>>;
  /** Frozen root band slack σ (H2.6, 16:9 only; empty when `"free"`). */
  readonly sigmaBands: Readonly<Record<string, number>>;
  /** Frozen `free-cell` legend cell coordinates chosen at nominal (H2.8). */
  readonly legendCell?: { readonly bandId: string; readonly colId: string };
  /** Nominal achieved outer ratio (boxes ∪ routes ∪ labels ∪ legend, H2.6). */
  readonly nominalAspect?: number;
  /** Info payload when `16:9 ± 2%` could not be reached within the σ cap (H2.6). */
  readonly aspectUnreached?: { readonly achieved: number; readonly target: number };
}

export interface SubtreeNodeSnapshot {
  readonly entity: EntityRef;
  readonly runKey: string;
  readonly outerWidth: number;
  readonly packedSize: { readonly width: number; readonly height: number };
  readonly header?: HeaderMeasurement;
  readonly headerInput?: EntityMeasurementInput;
  readonly headerWidth?: number;
  readonly composedGrid?: GridLayoutResult;
  readonly composedStack?: StackLayoutResult;
  readonly composedUnplaced?: readonly EntityRef[];
  readonly packedRun?: unknown;
  readonly levelRun?: unknown;
  readonly chosen?: { readonly orientation: LevelOrientation; readonly shelves: readonly (readonly number[])[] };
  readonly orientation?: LevelOrientation;
}

export interface SubtreeMemoEntry {
  readonly naturalSize: { readonly width: number; readonly height: number };
  readonly descendants: readonly SubtreeNodeSnapshot[];
}

export interface SubtreeMemoStats {
  readonly entries: number;
  readonly hits: number;
  readonly misses: number;
}

export interface SubtreeMemo {
  get(key: string): SubtreeMemoEntry | undefined;
  set(key: string, entry: SubtreeMemoEntry): void;
  clear(): void;
  stats(): SubtreeMemoStats;
}

/** Create a bounded subtree memo keyed per H2-STEP0 §4.5 D-6. */
export function createSubtreeMemo(maxEntries = 1024): SubtreeMemo {
  const entries = new Map<string, SubtreeMemoEntry>();
  let hits = 0;
  let misses = 0;
  return {
    get(key: string): SubtreeMemoEntry | undefined {
      const hit = entries.get(key);
      if (hit === undefined) {
        misses += 1;
        return undefined;
      }
      hits += 1;
      entries.delete(key);
      entries.set(key, hit);
      return hit;
    },
    set(key: string, entry: SubtreeMemoEntry): void {
      if (maxEntries <= 0) return;
      entries.delete(key);
      entries.set(key, entry);
      while (entries.size > maxEntries) {
        const oldest = entries.keys().next().value;
        if (oldest === undefined) break;
        entries.delete(oldest);
      }
    },
    clear(): void {
      entries.clear();
      hits = 0;
      misses = 0;
    },
    stats(): SubtreeMemoStats {
      return { entries: entries.size, hits, misses };
    },
  };
}

/**
 * Strip fold state and camera from a retained or projected view to produce its
 * fold-neutral form (§4.2 S-1 plan key & nominal projection):
 * - filters, entity/port occurrences, summaryLabels and revision kept;
 * - `groups.*.collapsed` cleared;
 * - pure `stampGroups`-generated fold groups (id === `foldGroupId(occurrence)`,
 *   no label, unreferenced by any `entityOccurrence.group`) dropped;
 * - relation endpoints restored to their retained `sourceOccurrence` origins
 *   (matching the stripping step of `reprojectRetained`, `fold.ts:368-382`);
 * - camera cleared (host state, outside layout identity).
 */
export function foldNeutralView(sourceView: ViewDocument): ViewDocument {
  const referencedGroups = new Set<string>();
  for (const occ of Object.values(sourceView.entityOccurrences)) {
    if (occ.group !== undefined) referencedGroups.add(occ.group);
  }
  const groups: Record<string, VisualGroup> = {};
  for (const key of Object.keys(sourceView.groups).sort(byString)) {
    const group = sourceView.groups[key]!;
    const isStampedOnly =
      group.occurrence !== undefined &&
      key === foldGroupId(group.occurrence) &&
      group.label === undefined &&
      !referencedGroups.has(key);
    if (isStampedOnly) continue;
    const { collapsed: _collapsed, ...rest } = group;
    void _collapsed;
    groups[key] = rest;
  }
  const relationOccurrences: Record<string, RelationOccurrence> = {};
  for (const key of Object.keys(sourceView.relationOccurrences).sort(byString)) {
    const occurrence = sourceView.relationOccurrences[key]!;
    relationOccurrences[key] = {
      ...occurrence,
      endpoints: occurrence.endpoints.map((endpoint) =>
        endpoint.chainProvenance !== undefined
          ? endpoint
          : endpoint.sourceOccurrence === undefined
            ? { role: endpoint.role, occurrence: endpoint.occurrence }
            : { role: endpoint.role, occurrence: endpoint.sourceOccurrence },
      ),
    };
  }
  return {
    ...sourceView,
    groups,
    relationOccurrences,
    presentation: {
      ...sourceView.presentation,
      camera: undefined as unknown as ViewDocument["presentation"]["camera"],
    },
  };
}

export function computePlanDigest(fields: {
  readonly tau: number;
  readonly autoPackLevels: Readonly<Record<string, FrozenAutoPackLevel>>;
  readonly innerWiden: Readonly<Record<string, number>>;
  readonly sigmaCols: Readonly<Record<string, number>>;
  readonly sigmaBands: Readonly<Record<string, number>>;
  readonly legendCell?: { readonly bandId: string; readonly colId: string };
}): string {
  return digestOf(canonicalise(fields));
}

const CAMERA_TOKENS = new Set([
  "--st-component-diagramScene-maxDisplayScale",
  "--st-component-diagramScene-minReadableScale",
  "--st-component-diagramScene-transitionDuration",
  "--st-foundation-motion-easing",
  "diagramScene.maxDisplayScale",
  "diagramScene.minReadableScale",
  "diagramScene.transitionDuration",
  "foundation.motion.easing",
]);

const ROLES: readonly TextRole[] = [
  "kicker",
  "title",
  "body",
  "detail",
  "footer",
  "subtitle",
  "legend-label",
  "edge-label",
  "flow-badge",
];

/**
 * Shared input-record builder used by both the layout result key and the
 * derived nominal plan key (§4.2 S-1). Any placement input added here enters
 * both keys by construction.
 */
export function buildLayoutKeyRecord(args: {
  readonly fingerprint: string;
  readonly options: LayoutOptions;
  readonly measured: boolean;
  readonly documentDigest: string;
  readonly presentationDigest: string;
  readonly sourceViewDigest: string;
  readonly registryDigest: readonly unknown[];
  readonly bindingsDigest: string | undefined;
  readonly includeTargetWidth: boolean;
}): Record<string, unknown> {
  const { options, measured } = args;
  const metrics = { ...DEFAULT_LAYOUT_METRICS, ...options.metrics };
  const edgeLabelSize =
    metrics.edgeLabelSize !== undefined && Number.isFinite(metrics.edgeLabelSize) && metrics.edgeLabelSize > 0
      ? metrics.edgeLabelSize
      : DEFAULT_EDGE_LABEL_SIZE;
  return {
    fingerprint: args.fingerprint,
    ...(args.includeTargetWidth ? { targetWidth: options.targetWidth } : {}),
    metrics: {
      ...Object.fromEntries(
        (
          [
            "nodePaddingX",
            "nodePaddingY",
            "nodeMinWidth",
            "nodeMinHeight",
            "containerPadding",
            "titlePaddingY",
            "rankGap",
          ] as const
        ).map((name) => [name, name === "rankGap" ? options.hints?.rankGap ?? metrics.rankGap : metrics[name]]),
      ),
      edgeLabelSize,
    },
    pathKind: measured ? "measured" : "compatibility",
    documentDigest: args.documentDigest,
    presentationDigest: args.presentationDigest,
    sourceViewDigest: args.sourceViewDigest,
    registry: args.registryDigest,
    bindings: args.bindingsDigest,
    ...(options.reportSurfaceSame === true ? { reportSurfaceSame: true } : {}),
    ...(options.conventions === undefined ? {} : { conventions: options.conventions }),
    ...(options.hints?.composition === undefined
      ? {}
      : {
          legend: {
            anchor: options.legend ?? "right",
            title: options.legendTitle ?? "Legend",
            labels: options.legendLabels ?? {},
          },
        }),
  };
}

/**
 * Compute the derived nominal plan key for a composed layout call (§4.2 S-1).
 * Returns `undefined` when `options.hints?.composition` is absent or inputs are
 * non-serialisable.
 */
export function computeCompositionPlanKey(
  document: SemanticDocument,
  options: LayoutOptions,
  sourceView?: ViewDocument,
  rawTokens?: Readonly<Record<string, number>>,
): string | undefined {
  if (options.hints?.composition === undefined) return undefined;
  const measured = sourceView !== undefined || options.presentation !== undefined;
  if (!measured) return undefined;
  const tokens = Object.fromEntries(
    Object.entries(rawTokens ?? {}).filter(([name]) => !CAMERA_TOKENS.has(name)),
  );
  const { previousOrientation: _previous, ...baseOptions } = options;
  void _previous;
  const r7Routing = isR7ConnectorPresentation(options.presentation, sourceView, document);
  const planFingerprint = layoutFingerprint({
    options: { ...baseOptions, collapsed: [] },
    tokens,
    r7Routing,
  });
  const enc = (value: unknown): string | undefined => {
    const out = tryCanonicalise(value);
    return out.ok ? digestOf(out.text) : undefined;
  };
  const documentDigest = enc(document);
  const presentationDigest = options.presentation === undefined ? "" : enc(options.presentation);
  const sourceViewDigest = sourceView === undefined ? "" : enc(foldNeutralView(sourceView));
  const bindingsDigest = options.bindings === undefined ? "" : enc(options.bindings);
  if (documentDigest === undefined || presentationDigest === undefined || sourceViewDigest === undefined) {
    return undefined;
  }
  const registryDigest = [...options.registry.list()].sort(byString).map((id) => {
    const profile = options.registry.get(id);
    return profile === undefined ? [id] : [id, profile.version, enc(profile)];
  });
  const record = buildLayoutKeyRecord({
    fingerprint: planFingerprint,
    options,
    measured,
    documentDigest,
    presentationDigest,
    sourceViewDigest,
    registryDigest,
    bindingsDigest,
    includeTargetWidth: false,
  });
  const encoded = tryCanonicalise(record);
  if (!encoded.ok) return undefined;
  const flows = Object.values(document.relations).some((r) => r.type === "flow-step");
  let mDigest = "missing";
  if (options.measureLines !== undefined) {
    const probe = ROLES.filter((role) => flows || role !== "flow-badge").map((role) =>
      options.measureLines!({
        text: "Mm09 É—",
        role,
        availableWidth: 290,
        allocatedLines: DEFAULT_ALLOCATED_LINES[role],
        folded: false,
      }),
    );
    const baseMeasurer = digestOf(canonicalise({ version: options.measureLines.version, probe }));
    const legendProbe = measureLegendProbe(options.measureLines, options.legendTitle, options.legendLabels);
    mDigest = baseMeasurer + digestOf(canonicalise(legendProbe));
  }
  return digestOf(encoded.text) + mDigest;
}

/**
 * Audit painted gaps between every pair of adjacent sibling containers
 * (expanded or folded) across composed grids and auto-packed levels (F-6).
 *
 * Returns all adjacent pairs and the filtered subset whose painted gap exceeds
 * `zoneGutter` (due to slot slack from wider tracks or σ).
 */
export function auditSiblingZonePaintedGaps(args: {
  readonly gridReports: Readonly<Record<string, ComposedGridReport>>;
  readonly packedLevels: readonly {
    readonly scope: string;
    readonly rows: boolean;
    readonly shelves: readonly (readonly { readonly entity: EntityRef; readonly rect: Rect }[])[];
  }[];
  readonly isContainer: (entity: EntityRef) => boolean;
  readonly zoneGutter: number;
}): {
  readonly all: readonly ComposedPaintedGap[];
  readonly aboveToken: readonly ComposedPaintedGap[];
} {
  const { gridReports, packedLevels, isContainer, zoneGutter } = args;
  const seen = new Set<string>();
  const all: ComposedPaintedGap[] = [];
  const pushPair = (entry: ComposedPaintedGap): void => {
    const key = `${entry.scope}|${entry.axis}|${entry.left}|${entry.right}`;
    if (seen.has(key)) return;
    seen.add(key);
    all.push(entry);
  };

  for (const scope of Object.keys(gridReports).sort(byString)) {
    const report = gridReports[scope]!;
    const containerCells = report.cells.filter((cell) => isContainer(cell.entity));
    for (let i = 0; i < containerCells.length; i += 1) {
      const a = containerCells[i]!;
      for (let j = 0; j < containerCells.length; j += 1) {
        if (i === j) continue;
        const b = containerCells[j]!;
        // Horizontally adjacent across a column boundary (staged / peripheral).
        if (
          a.colEnd >= 0 &&
          b.colStart >= 0 &&
          a.colEnd + 1 === b.colStart &&
          a.bandStart >= 0 &&
          b.bandStart >= 0 &&
          Math.max(a.bandStart, b.bandStart) <= Math.min(a.bandEnd, b.bandEnd)
        ) {
          const colA = report.columns[a.colEnd];
          const colB = report.columns[b.colStart];
          if (colA !== undefined && colB !== undefined) {
            const gutter = clean(colB.start - (colA.start + colA.size));
            const fromSlack = clean(colA.start + colA.size - (a.boxRect.x + a.boxRect.width));
            const toSlack = clean(b.boxRect.x - colB.start);
            const paintedGap = clean(b.boxRect.x - (a.boxRect.x + a.boxRect.width));
            pushPair({
              scope,
              axis: "horizontal",
              left: a.entity,
              right: b.entity,
              paintedGap,
              token: gutter,
              slack: clean(fromSlack + toSlack),
              fromSlack,
              toSlack,
            });
          }
        }
        // Vertically adjacent across a band boundary.
        if (a.bandEnd >= 0 && b.bandStart >= 0 && a.bandEnd + 1 === b.bandStart) {
          const sameColRange =
            a.colStart >= 0 && b.colStart >= 0
              ? Math.max(a.colStart, b.colStart) <= Math.min(a.colEnd, b.colEnd)
              : Math.min(a.boxRect.x + a.boxRect.width, b.boxRect.x + b.boxRect.width) >
                Math.max(a.boxRect.x, b.boxRect.x);
          if (sameColRange) {
            const bandA = report.bands[a.bandEnd];
            const bandB = report.bands[b.bandStart];
            if (bandA !== undefined && bandB !== undefined) {
              const gutter = clean(bandB.start - (bandA.start + bandA.size));
              const fromSlack = clean(bandA.start + bandA.size - (a.boxRect.y + a.boxRect.height));
              const toSlack = clean(b.boxRect.y - bandB.start);
              const paintedGap = clean(b.boxRect.y - (a.boxRect.y + a.boxRect.height));
              pushPair({
                scope,
                axis: "vertical",
                left: a.entity,
                right: b.entity,
                paintedGap,
                token: gutter,
                slack: clean(fromSlack + toSlack),
                fromSlack,
                toSlack,
              });
            }
          }
        }
      }
    }
  }

  for (const level of packedLevels) {
    const { scope, rows, shelves } = level;
    for (let s = 0; s < shelves.length; s += 1) {
      const shelf = shelves[s]!;
      const shelfEnd = rows
        ? Math.max(...shelf.map((item) => item.rect.y + item.rect.height))
        : Math.max(...shelf.map((item) => item.rect.x + item.rect.width));
      const nextShelf = shelves[s + 1];
      const nextStart =
        nextShelf === undefined
          ? undefined
          : rows
            ? Math.min(...nextShelf.map((item) => item.rect.y))
            : Math.min(...nextShelf.map((item) => item.rect.x));
      // Along shelf
      for (let k = 0; k < shelf.length - 1; k += 1) {
        const a = shelf[k]!;
        const b = shelf[k + 1]!;
        if (!isContainer(a.entity) || !isContainer(b.entity)) continue;
        const paintedGap = clean(rows ? b.rect.x - (a.rect.x + a.rect.width) : b.rect.y - (a.rect.y + a.rect.height));
        pushPair({
          scope,
          axis: rows ? "horizontal" : "vertical",
          left: a.entity,
          right: b.entity,
          paintedGap,
          token: zoneGutter,
          slack: clean(paintedGap - zoneGutter),
          fromSlack: 0,
          toSlack: clean(paintedGap - zoneGutter),
        });
      }
      // Across shelves
      if (nextShelf !== undefined && nextStart !== undefined) {
        const gutter = clean(nextStart - shelfEnd);
        for (const a of shelf) {
          if (!isContainer(a.entity)) continue;
          for (const b of nextShelf) {
            if (!isContainer(b.entity)) continue;
            const overlaps = rows
              ? Math.min(a.rect.x + a.rect.width, b.rect.x + b.rect.width) > Math.max(a.rect.x, b.rect.x)
              : Math.min(a.rect.y + a.rect.height, b.rect.y + b.rect.height) > Math.max(a.rect.y, b.rect.y);
            if (!overlaps) continue;
            const fromSlack = clean(rows ? shelfEnd - (a.rect.y + a.rect.height) : shelfEnd - (a.rect.x + a.rect.width));
            const toSlack = clean(rows ? b.rect.y - nextStart : b.rect.x - nextStart);
            const paintedGap = clean(rows ? b.rect.y - (a.rect.y + a.rect.height) : b.rect.x - (a.rect.x + a.rect.width));
            pushPair({
              scope,
              axis: rows ? "vertical" : "horizontal",
              left: a.entity,
              right: b.entity,
              paintedGap,
              token: gutter,
              slack: clean(fromSlack + toSlack),
              fromSlack,
              toSlack,
            });
          }
        }
      }
    }
  }

  all.sort(
    (left, right) =>
      byString(left.scope, right.scope) ||
      byString(left.axis, right.axis) ||
      byString(left.left, right.left) ||
      byString(left.right, right.right),
  );
  const aboveToken = all.filter((entry) => entry.paintedGap > zoneGutter + 1e-6);
  return { all, aboveToken };
}
