/**
 * Composed layout solver (`ds-layout-hints@2`, H2.3/H2.4):
 * horizontal transverse bands, stage columns, peripheral columns,
 * single-line stacks, alignment, holes, spans (including I-13 span-only lanes),
 * trailing band for unplaced visible children, and direct gutter strip emission.
 *
 * Pure geometry: no DOM, no randomness, no authored coordinates or gaps.
 */
import type {
  EntityRef,
  LayoutCell,
  LayoutCellAlign,
  LayoutGrid,
  LayoutPeripheralColumn,
  LayoutStack,
} from "@sentropic/diagram-core";

import type { Rect } from "../transform.js";
import type { ResolvedRowGaps } from "./hints.js";

export interface ComposedGutter {
  readonly id: string;
  /** True for a horizontal lane (its thickness is height, separating vertical tracks). */
  readonly horizontal: boolean;
  readonly strips: readonly Rect[];
  readonly gap: number;
  readonly base: number;
  readonly authoredBase: false;
  readonly max: number;
  readonly zone: boolean;
}

export interface ComposedTrackLine {
  readonly id: string;
  readonly kind: "peripheral-start" | "stage" | "peripheral-end" | "band" | "trailing";
  readonly start: number;
  readonly size: number;
}

export interface ComposedCellPlacement {
  readonly entity: EntityRef;
  readonly relX: number;
  readonly relY: number;
  readonly width: number;
  readonly height: number;
  readonly slotRelRect: Rect;
  readonly stretchX: boolean;
  readonly stretchY: boolean;
  readonly isPeripheral: boolean;
  readonly colStart: number;
  readonly colEnd: number;
  readonly bandStart: number;
  readonly bandEnd: number;
}

export interface ComposedGridReport {
  readonly scope: string;
  readonly runKey: string;
  readonly columns: readonly ComposedTrackLine[];
  readonly bands: readonly ComposedTrackLine[];
  readonly cells: readonly {
    readonly entity: EntityRef;
    readonly slotRect: Rect;
    readonly boxRect: Rect;
    readonly colStart: number;
    readonly colEnd: number;
    readonly bandStart: number;
    readonly bandEnd: number;
  }[];
}

export interface ComposedPaintedGap {
  readonly scope: string;
  readonly axis: "horizontal" | "vertical";
  readonly left: EntityRef;
  readonly right: EntityRef;
  readonly paintedGap: number;
  readonly token: number;
  readonly slack: number;
}

export interface LayoutCompositionReport {
  readonly grids: Readonly<Record<string, ComposedGridReport>>;
  readonly planDigest?: string;
  readonly nominalAspect?: number;
  readonly paintedGapsAboveToken?: readonly ComposedPaintedGap[];
  readonly combFallbacks?: readonly { readonly hub: string; readonly members: readonly string[]; readonly reason: string }[];
}

export interface GridLayoutInput {
  readonly scope: string;
  readonly runKey: string;
  readonly grid: LayoutGrid;
  readonly visibleChildren: readonly EntityRef[];
  readonly sizeOf: (entity: EntityRef) => { readonly width: number; readonly height: number };
  readonly isContainer: (entity: EntityRef) => boolean;
  readonly isExpandedContainer: (entity: EntityRef) => boolean;
  readonly rowGaps: ResolvedRowGaps;
  readonly zoneGutter: number;
  readonly widen?: ReadonlyMap<string, number> | undefined;
  /** Optional plan slack per root track id (H2.6). */
  readonly sigmaCols?: ReadonlyMap<string, number> | undefined;
  readonly sigmaBands?: ReadonlyMap<string, number> | undefined;
}

export interface GridLayoutResult {
  readonly scope: string;
  readonly runKey: string;
  readonly width: number;
  readonly height: number;
  readonly columns: readonly ComposedTrackLine[];
  readonly bands: readonly ComposedTrackLine[];
  readonly placements: readonly ComposedCellPlacement[];
  readonly unplaced: readonly EntityRef[];
  readonly emitGutters: (originX: number, originY: number) => ComposedGutter[];
  readonly toReport: (originX: number, originY: number) => ComposedGridReport;
}

export interface StackLayoutInput {
  readonly scope: string;
  readonly runKey: string;
  readonly stack: LayoutStack;
  readonly visibleChildren: readonly EntityRef[];
  readonly sizeOf: (entity: EntityRef) => { readonly width: number; readonly height: number };
  readonly isContainer: (entity: EntityRef) => boolean;
  readonly isExpandedContainer: (entity: EntityRef) => boolean;
  readonly rowGaps: ResolvedRowGaps;
  readonly zoneGutter: number;
  readonly widen?: ReadonlyMap<string, number> | undefined;
}

export interface StackLayoutResult {
  readonly scope: string;
  readonly runKey: string;
  readonly axis: "row" | "column";
  readonly width: number;
  readonly height: number;
  readonly placements: readonly {
    readonly entity: EntityRef;
    readonly relX: number;
    readonly relY: number;
    readonly width: number;
    readonly height: number;
    readonly stretchX: boolean;
    readonly stretchY: boolean;
  }[];
  readonly emitGutters: (originX: number, originY: number) => ComposedGutter[];
}

const clean = (value: number): number => (value === 0 ? 0 : value);

/**
 * Distribute positive excess across `count` tracks in whole world units,
 * remainder to the last track (H2-STEP0 §4.3 step 3, D-4).
 */
export function distributeWholeExcess(sizes: number[], start: number, end: number, rawExcess: number): void {
  if (!(rawExcess > 0)) return;
  const total = Math.ceil(rawExcess);
  const count = end - start + 1;
  const share = Math.floor(total / count);
  const remainder = total - share * count;
  for (let idx = start; idx <= end; idx += 1) {
    sizes[idx] = (sizes[idx] ?? 0) + share + (idx === end ? remainder : 0);
  }
}

function effectiveAlign(
  authored: LayoutCellAlign | undefined,
  expandedContainer: boolean,
): LayoutCellAlign {
  const chosen = authored ?? (expandedContainer ? "stretch" : "center");
  // Fixed-footprint boxes (leaf cards and folded containers) are never enlarged.
  if (!expandedContainer && chosen === "stretch") return "center";
  return chosen;
}

function alignWithin(
  slotStart: number,
  slotSize: number,
  naturalSize: number,
  align: LayoutCellAlign,
  expandedContainer: boolean,
): { readonly pos: number; readonly size: number; readonly stretched: boolean } {
  if (align === "stretch" && expandedContainer) {
    return { pos: slotStart, size: Math.max(naturalSize, slotSize), stretched: true };
  }
  const slack = Math.max(0, slotSize - naturalSize);
  if (align === "start") return { pos: slotStart, size: naturalSize, stretched: false };
  if (align === "end") return { pos: slotStart + slack, size: naturalSize, stretched: false };
  return { pos: slotStart + slack / 2, size: naturalSize, stretched: false };
}

function resolveBoundaryGap(
  boundaryId: string,
  hasZone: boolean,
  cardGap: number,
  zoneGutter: number,
  maxCap: number,
  widen: ReadonlyMap<string, number> | undefined,
): { readonly gap: number; readonly base: number } {
  if (hasZone) return { gap: zoneGutter, base: zoneGutter };
  const requested = widen?.get(boundaryId) ?? 0;
  return { gap: Math.min(maxCap, Math.max(cardGap, requested)), base: cardGap };
}

interface InternalCellSpec {
  readonly entity: EntityRef;
  readonly declOrder: number;
  readonly colStartDecl: number;
  readonly colEndDecl: number;
  readonly bandStartDecl: number;
  readonly bandEndDecl: number;
  readonly cell: LayoutCell | undefined;
  readonly width: number;
  readonly height: number;
  readonly isContainer: boolean;
  readonly isExpanded: boolean;
}

interface ActivePeripheral {
  readonly column: LayoutPeripheralColumn;
  readonly items: readonly {
    readonly entity: EntityRef;
    readonly width: number;
    readonly height: number;
    readonly isContainer: boolean;
    readonly isExpanded: boolean;
  }[];
  readonly width: number;
  readonly naturalHeight: number;
  readonly itemGaps: readonly { readonly id: string; readonly gap: number; readonly base: number; readonly zone: boolean }[];
  readonly hasContainer: boolean;
  readonly fromBandActive: number;
}

/**
 * Lay out one grid scope (`root` or container) without column inheritance.
 *
 * I-13 zero-excess span invariant: a staged band listed with `items: []` that
 * is covered by a visible cell's `to_band` span stays in the active band list
 * (it does NOT collapse and its two surrounding gutters remain distinct). When
 * spanning cells already fit in earlier bands + gutters (excess === 0), that
 * band has height `0` with both boundary gutters preserved at their token widths.
 */
export function layoutGridScope(input: GridLayoutInput): GridLayoutResult {
  const {
    scope,
    runKey,
    grid,
    visibleChildren,
    sizeOf,
    isContainer,
    isExpandedContainer,
    rowGaps,
    zoneGutter,
    widen,
    sigmaCols,
    sigmaBands,
  } = input;

  const visibleSet = new Set<EntityRef>(visibleChildren);
  const declaredPlaced = new Set<EntityRef>();
  for (const band of grid.transverse_bands) {
    for (const item of band.items) declaredPlaced.add(item);
  }
  for (const col of grid.peripheral_columns ?? []) {
    for (const item of col.items) declaredPlaced.add(item);
  }
  const unplaced = visibleChildren.filter((entity) => !declaredPlaced.has(entity));

  const stageCols = Array.isArray(grid.stage_columns) ? grid.stage_columns : undefined;
  const staged = stageCols !== undefined;

  const startPeripheralsRaw = (grid.peripheral_columns ?? []).filter((c) => c.side === "start");
  const endPeripheralsRaw = (grid.peripheral_columns ?? []).filter((c) => c.side === "end");

  const buildPeripheral = (
    column: LayoutPeripheralColumn,
    declBandToActive: ReadonlyMap<number, number>,
    activeBandCount: number,
  ): ActivePeripheral | undefined => {
    const visibleItems = column.items.filter((item) => visibleSet.has(item));
    if (visibleItems.length === 0) return undefined;
    const measured = visibleItems.map((entity) => {
      const sz = sizeOf(entity);
      return {
        entity,
        width: sz.width,
        height: sz.height,
        isContainer: isContainer(entity),
        isExpanded: isExpandedContainer(entity),
      };
    });
    const width = Math.max(...measured.map((item) => item.width));
    const itemGaps: { id: string; gap: number; base: number; zone: boolean }[] = [];
    let naturalHeight = measured.reduce((sum, item) => sum + item.height, 0);
    for (let i = 0; i < measured.length - 1; i += 1) {
      const z = measured[i]!.isContainer || measured[i + 1]!.isContainer;
      const id = `${runKey}|peripheral|${column.id}|${String(i)}`;
      const { gap, base } = resolveBoundaryGap(id, z, rowGaps.cardY, zoneGutter, rowGaps.maxY, widen);
      itemGaps.push({ id, gap, base, zone: z });
      naturalHeight += gap;
    }
    let fromBandActive = 0;
    if (column.from_band !== undefined && activeBandCount > 0) {
      const declIdx = grid.transverse_bands.findIndex((band) => band.id === column.from_band);
      if (declIdx >= 0) {
        let found: number | undefined;
        for (let b = declIdx; b < grid.transverse_bands.length; b += 1) {
          const activeIdx = declBandToActive.get(b);
          if (activeIdx !== undefined) {
            found = activeIdx;
            break;
          }
        }
        fromBandActive = found ?? activeBandCount - 1;
      }
    }
    return {
      column,
      items: measured,
      width,
      naturalHeight,
      itemGaps,
      hasContainer: measured.some((item) => item.isContainer),
      fromBandActive,
    };
  };

  if (staged) {
    return layoutStagedGrid({
      scope,
      runKey,
      grid,
      stageCols,
      visibleSet,
      unplaced,
      startPeripheralsRaw,
      endPeripheralsRaw,
      buildPeripheral,
      sizeOf,
      isContainer,
      isExpandedContainer,
      rowGaps,
      zoneGutter,
      widen,
      sigmaCols,
      sigmaBands,
    });
  }

  return layoutUnstagedGrid({
    scope,
    runKey,
    grid,
    visibleSet,
    unplaced,
    startPeripheralsRaw,
    endPeripheralsRaw,
    buildPeripheral,
    sizeOf,
    isContainer,
    isExpandedContainer,
    rowGaps,
    zoneGutter,
    widen,
    sigmaCols,
    sigmaBands,
  });
}

function placePeripheralItems(
  peripheral: ActivePeripheral,
  colX: number,
  colIndex: number,
  topY: number,
  bandsBottom: number,
  lastBandIdx: number,
  placements: ComposedCellPlacement[],
  gutterCollectors: ((originX: number, originY: number) => ComposedGutter)[],
  rowGaps: ResolvedRowGaps,
): number {
  const targetHeight = Math.max(peripheral.naturalHeight, Math.max(0, bandsBottom - topY));
  const extraHeight = targetHeight - peripheral.naturalHeight;
  const expandedIndices = peripheral.items
    .map((item, idx) => (item.isExpanded ? idx : -1))
    .filter((idx) => idx >= 0);
  const heights = peripheral.items.map((item) => item.height);
  if (extraHeight > 0 && expandedIndices.length > 0) {
    const share = Math.floor(extraHeight / expandedIndices.length);
    const rem = extraHeight - share * expandedIndices.length;
    expandedIndices.forEach((idx, k) => {
      heights[idx] = heights[idx]! + share + (k === expandedIndices.length - 1 ? rem : 0);
    });
  }
  let cursorY = topY;
  peripheral.items.forEach((item, idx) => {
    const h = heights[idx]!;
    const w = item.isExpanded ? Math.max(item.width, peripheral.width) : item.width;
    const x = item.isExpanded ? colX : colX + (peripheral.width - w) / 2;
    const slotRelRect: Rect = { x: colX, y: cursorY, width: peripheral.width, height: h };
    placements.push({
      entity: item.entity,
      relX: clean(x),
      relY: clean(cursorY),
      width: w,
      height: h,
      slotRelRect,
      stretchX: item.isExpanded && w > item.width,
      stretchY: item.isExpanded && h > item.height,
      isPeripheral: true,
      colStart: colIndex,
      colEnd: colIndex,
      bandStart: peripheral.fromBandActive,
      bandEnd: Math.max(peripheral.fromBandActive, lastBandIdx),
    });
    cursorY += h;
    const gapInfo = peripheral.itemGaps[idx];
    if (gapInfo !== undefined) {
      const gy = cursorY;
      gutterCollectors.push((originX, originY) => ({
        id: gapInfo.id,
        horizontal: true,
        strips: [{ x: originX + colX, y: originY + gy, width: peripheral.width, height: gapInfo.gap }],
        gap: gapInfo.gap,
        base: gapInfo.base,
        authoredBase: false,
        max: rowGaps.maxY,
        zone: gapInfo.zone,
      }));
      cursorY += gapInfo.gap;
    }
  });
  return cursorY;
}

function layoutTrailingBand(
  runKey: string,
  unplaced: readonly EntityRef[],
  sizeOf: (entity: EntityRef) => { readonly width: number; readonly height: number },
  isContainer: (entity: EntityRef) => boolean,
  isExpandedContainer: (entity: EntityRef) => boolean,
  rowGaps: ResolvedRowGaps,
  zoneGutter: number,
  widen: ReadonlyMap<string, number> | undefined,
): {
  readonly width: number;
  readonly height: number;
  readonly hasContainer: boolean;
  readonly items: readonly {
    readonly entity: EntityRef;
    readonly relX: number;
    readonly width: number;
    readonly height: number;
    readonly isExpanded: boolean;
  }[];
  readonly gaps: readonly { readonly id: string; readonly startX: number; readonly gap: number; readonly base: number; readonly zone: boolean }[];
} {
  let cursorX = 0;
  let height = 0;
  let hasContainer = false;
  const measured = unplaced.map((entity) => {
    const sz = sizeOf(entity);
    const cont = isContainer(entity);
    if (cont) hasContainer = true;
    height = Math.max(height, sz.height);
    return { entity, width: sz.width, height: sz.height, isContainer: cont, isExpanded: isExpandedContainer(entity) };
  });
  const items: { entity: EntityRef; relX: number; width: number; height: number; isExpanded: boolean }[] = [];
  const gaps: { id: string; startX: number; gap: number; base: number; zone: boolean }[] = [];
  measured.forEach((item, idx) => {
    items.push({ entity: item.entity, relX: cursorX, width: item.width, height: item.height, isExpanded: item.isExpanded });
    cursorX += item.width;
    const next = measured[idx + 1];
    if (next !== undefined) {
      const z = item.isContainer || next.isContainer;
      const id = `${runKey}|along|__trailing__|${String(idx)}`;
      const { gap, base } = resolveBoundaryGap(id, z, rowGaps.cardX, zoneGutter, rowGaps.maxX, widen);
      gaps.push({ id, startX: cursorX, gap, base, zone: z });
      cursorX += gap;
    }
  });
  return { width: cursorX, height, hasContainer, items, gaps };
}

function layoutStagedGrid(args: {
  readonly scope: string;
  readonly runKey: string;
  readonly grid: LayoutGrid;
  readonly stageCols: readonly string[];
  readonly visibleSet: ReadonlySet<EntityRef>;
  readonly unplaced: readonly EntityRef[];
  readonly startPeripheralsRaw: readonly LayoutPeripheralColumn[];
  readonly endPeripheralsRaw: readonly LayoutPeripheralColumn[];
  readonly buildPeripheral: (
    col: LayoutPeripheralColumn,
    declBandToActive: ReadonlyMap<number, number>,
    activeBandCount: number,
  ) => ActivePeripheral | undefined;
  readonly sizeOf: (entity: EntityRef) => { readonly width: number; readonly height: number };
  readonly isContainer: (entity: EntityRef) => boolean;
  readonly isExpandedContainer: (entity: EntityRef) => boolean;
  readonly rowGaps: ResolvedRowGaps;
  readonly zoneGutter: number;
  readonly widen?: ReadonlyMap<string, number> | undefined;
  readonly sigmaCols?: ReadonlyMap<string, number> | undefined;
  readonly sigmaBands?: ReadonlyMap<string, number> | undefined;
}): GridLayoutResult {
  const {
    scope,
    runKey,
    grid,
    stageCols,
    visibleSet,
    unplaced,
    startPeripheralsRaw,
    endPeripheralsRaw,
    buildPeripheral,
    sizeOf,
    isContainer,
    isExpandedContainer,
    rowGaps,
    zoneGutter,
    widen,
    sigmaCols,
    sigmaBands,
  } = args;

  const bandIds = grid.transverse_bands.map((b) => b.id);
  const cells: InternalCellSpec[] = [];
  let declOrder = 0;
  grid.transverse_bands.forEach((band, bandIdx) => {
    for (const item of band.items) {
      if (!visibleSet.has(item)) continue;
      const cell = grid.cells?.[item];
      if (cell?.column === undefined) continue;
      const colStartDecl = stageCols.indexOf(cell.column);
      const colEndDecl = cell.to_column === undefined ? colStartDecl : stageCols.indexOf(cell.to_column);
      const bandEndDecl = cell.to_band === undefined ? bandIdx : bandIds.indexOf(cell.to_band);
      if (colStartDecl < 0 || colEndDecl < colStartDecl || bandEndDecl < bandIdx) continue;
      const sz = sizeOf(item);
      cells.push({
        entity: item,
        declOrder,
        colStartDecl,
        colEndDecl,
        bandStartDecl: bandIdx,
        bandEndDecl,
        cell,
        width: sz.width,
        height: sz.height,
        isContainer: isContainer(item),
        isExpanded: isExpandedContainer(item),
      });
      declOrder += 1;
    }
  });

  // Determine covered columns and covered bands (including I-13 span-only bands).
  const coveredCols = new Set<number>();
  const coveredBands = new Set<number>();
  for (const c of cells) {
    for (let col = c.colStartDecl; col <= c.colEndDecl; col += 1) coveredCols.add(col);
    for (let b = c.bandStartDecl; b <= c.bandEndDecl; b += 1) coveredBands.add(b);
  }

  const activeStageDeclIndices = [...coveredCols].sort((a, b) => a - b);
  const activeBandDeclIndices = [...coveredBands].sort((a, b) => a - b);
  const declColToActive = new Map<number, number>(activeStageDeclIndices.map((decl, active) => [decl, active]));
  const declBandToActive = new Map<number, number>(activeBandDeclIndices.map((decl, active) => [decl, active]));

  const activeCells = cells.map((c) => ({
    ...c,
    colStart: declColToActive.get(c.colStartDecl)!,
    colEnd: declColToActive.get(c.colEndDecl)!,
    bandStart: declBandToActive.get(c.bandStartDecl)!,
    bandEnd: declBandToActive.get(c.bandEndDecl)!,
  }));

  const startPeripherals = startPeripheralsRaw
    .map((col) => buildPeripheral(col, declBandToActive, activeBandDeclIndices.length))
    .filter((p): p is ActivePeripheral => p !== undefined);
  const endPeripherals = endPeripheralsRaw
    .map((col) => buildPeripheral(col, declBandToActive, activeBandDeclIndices.length))
    .filter((p): p is ActivePeripheral => p !== undefined);

  const stageCount = activeStageDeclIndices.length;
  const bandCount = activeBandDeclIndices.length;

  // Stage column & band container presence (§4.3 step 5).
  const stageHasContainer = Array.from({ length: stageCount }, () => false);
  const bandHasContainer = Array.from({ length: bandCount }, () => false);
  for (const c of activeCells) {
    if (!c.isContainer) continue;
    for (let col = c.colStart; col <= c.colEnd; col += 1) stageHasContainer[col] = true;
    for (let b = c.bandStart; b <= c.bandEnd; b += 1) bandHasContainer[b] = true;
  }

  // All columns in order: start peripherals, active stages, end peripherals.
  interface ColMeta {
    readonly id: string;
    readonly kind: "peripheral-start" | "stage" | "peripheral-end";
    readonly hasContainer: boolean;
    readonly stageIndex?: number;
    readonly peripheral?: ActivePeripheral;
  }
  const allCols: ColMeta[] = [
    ...startPeripherals.map((p) => ({
      id: p.column.id,
      kind: "peripheral-start" as const,
      hasContainer: p.hasContainer,
      peripheral: p,
    })),
    ...activeStageDeclIndices.map((declIdx, activeIdx) => ({
      id: stageCols[declIdx]!,
      kind: "stage" as const,
      hasContainer: stageHasContainer[activeIdx]!,
      stageIndex: activeIdx,
    })),
    ...endPeripherals.map((p) => ({
      id: p.column.id,
      kind: "peripheral-end" as const,
      hasContainer: p.hasContainer,
      peripheral: p,
    })),
  ];

  // Resolve column boundary gutters BEFORE spanning contributions (§4.3 steps 3 & 5).
  const colBoundaryInfo: { readonly id: string; readonly gap: number; readonly base: number; readonly zone: boolean }[] = [];
  for (let i = 0; i < allCols.length - 1; i += 1) {
    const left = allCols[i]!;
    const right = allCols[i + 1]!;
    const z = left.hasContainer || right.hasContainer;
    const id = `${runKey}|along|${left.id}`;
    const { gap, base } = resolveBoundaryGap(id, z, rowGaps.cardX, zoneGutter, rowGaps.maxX, widen);
    colBoundaryInfo.push({ id, gap, base, zone: z });
  }

  // Resolve band boundary gutters BEFORE spanning contributions (§4.3 steps 3–5).
  const bandBoundaryInfo: { readonly id: string; readonly gap: number; readonly base: number; readonly zone: boolean }[] = [];
  for (let j = 0; j < bandCount - 1; j += 1) {
    const upperId = grid.transverse_bands[activeBandDeclIndices[j]!]!.id;
    const z = bandHasContainer[j]! || bandHasContainer[j + 1]!;
    const id = `${runKey}|across|${upperId}`;
    const { gap, base } = resolveBoundaryGap(id, z, rowGaps.cardY, zoneGutter, rowGaps.maxY, widen);
    bandBoundaryInfo.push({ id, gap, base, zone: z });
  }

  // Single-span widths for stage columns (§4.3 step 2).
  const stageWidths = Array.from({ length: stageCount }, () => 0);
  for (const c of activeCells) {
    if (c.colStart === c.colEnd) {
      stageWidths[c.colStart] = Math.max(stageWidths[c.colStart]!, c.width);
    }
  }
  // Spanning widths for stage columns by increasing span length then declaration order (§4.3 step 3).
  const colOffset = startPeripherals.length;
  const colSpanners = activeCells
    .filter((c) => c.colEnd > c.colStart)
    .sort((a, b) => (a.colEnd - a.colStart) - (b.colEnd - b.colStart) || a.declOrder - b.declOrder);
  for (const c of colSpanners) {
    let current = 0;
    for (let col = c.colStart; col <= c.colEnd; col += 1) {
      current += stageWidths[col]!;
      if (col < c.colEnd) current += colBoundaryInfo[colOffset + col]!.gap;
    }
    distributeWholeExcess(stageWidths, c.colStart, c.colEnd, c.width - current);
  }
  // Apply optional plan σ to stage columns (§4.3 step 6).
  if (sigmaCols !== undefined) {
    activeStageDeclIndices.forEach((declIdx, activeIdx) => {
      const add = sigmaCols.get(stageCols[declIdx]!) ?? 0;
      if (add > 0) stageWidths[activeIdx] = stageWidths[activeIdx]! + add;
    });
  }

  // Single-span heights for bands (§4.3 step 4).
  const bandHeights = Array.from({ length: bandCount }, () => 0);
  for (const c of activeCells) {
    if (c.bandStart === c.bandEnd) {
      bandHeights[c.bandStart] = Math.max(bandHeights[c.bandStart]!, c.height);
    }
  }
  // Spanning heights for bands by increasing span length then declaration order (§4.3 steps 3–4).
  const bandSpanners = activeCells
    .filter((c) => c.bandEnd > c.bandStart)
    .sort((a, b) => (a.bandEnd - a.bandStart) - (b.bandEnd - b.bandStart) || a.declOrder - b.declOrder);
  for (const c of bandSpanners) {
    let current = 0;
    for (let b = c.bandStart; b <= c.bandEnd; b += 1) {
      current += bandHeights[b]!;
      if (b < c.bandEnd) current += bandBoundaryInfo[b]!.gap;
    }
    distributeWholeExcess(bandHeights, c.bandStart, c.bandEnd, c.height - current);
  }
  // Apply optional plan σ to bands (§4.3 step 6).
  if (sigmaBands !== undefined) {
    activeBandDeclIndices.forEach((declIdx, activeIdx) => {
      const add = sigmaBands.get(grid.transverse_bands[declIdx]!.id) ?? 0;
      if (add > 0) bandHeights[activeIdx] = bandHeights[activeIdx]! + add;
    });
  }

  // Compute column coordinates.
  const colWidths = allCols.map((col) =>
    col.kind === "stage" ? stageWidths[col.stageIndex!]! : col.peripheral!.width,
  );
  const colStarts: number[] = [];
  let cursorX = 0;
  for (let i = 0; i < allCols.length; i += 1) {
    colStarts.push(cursorX);
    cursorX += colWidths[i]!;
    if (i < colBoundaryInfo.length) cursorX += colBoundaryInfo[i]!.gap;
  }
  const stageAndPeripheralWidth = cursorX;

  // Compute band coordinates.
  const bandStarts: number[] = [];
  let cursorY = 0;
  for (let j = 0; j < bandCount; j += 1) {
    bandStarts.push(cursorY);
    cursorY += bandHeights[j]!;
    if (j < bandBoundaryInfo.length) cursorY += bandBoundaryInfo[j]!.gap;
  }
  const declaredBandsBottom = cursorY;

  const placements: ComposedCellPlacement[] = [];
  const gutterCollectors: ((originX: number, originY: number) => ComposedGutter)[] = [];

  // Place stage band cells (§4.3 step 7).
  for (const c of activeCells) {
    const fullColStart = colOffset + c.colStart;
    const fullColEnd = colOffset + c.colEnd;
    const slotX = colStarts[fullColStart]!;
    const slotW = colStarts[fullColEnd]! + colWidths[fullColEnd]! - slotX;
    const slotY = bandStarts[c.bandStart]!;
    const slotH = bandStarts[c.bandEnd]! + bandHeights[c.bandEnd]! - slotY;
    const justify = effectiveAlign(c.cell?.justify, c.isExpanded);
    const align = effectiveAlign(c.cell?.align, c.isExpanded);
    const alignedX = alignWithin(slotX, slotW, c.width, justify, c.isExpanded);
    const alignedY = alignWithin(slotY, slotH, c.height, align, c.isExpanded);
    placements.push({
      entity: c.entity,
      relX: clean(alignedX.pos),
      relY: clean(alignedY.pos),
      width: alignedX.size,
      height: alignedY.size,
      slotRelRect: { x: clean(slotX), y: clean(slotY), width: slotW, height: slotH },
      stretchX: alignedX.stretched,
      stretchY: alignedY.stretched,
      isPeripheral: false,
      colStart: fullColStart,
      colEnd: fullColEnd,
      bandStart: c.bandStart,
      bandEnd: c.bandEnd,
    });
  }

  // Place peripheral columns (§1.4, §4.3 step 7).
  let maxBottom = declaredBandsBottom;
  allCols.forEach((col, fullColIdx) => {
    if (col.peripheral === undefined) return;
    const topY = bandCount > 0 ? bandStarts[col.peripheral.fromBandActive]! : 0;
    const bottom = placePeripheralItems(
      col.peripheral,
      colStarts[fullColIdx]!,
      fullColIdx,
      topY,
      declaredBandsBottom,
      Math.max(0, bandCount - 1),
      placements,
      gutterCollectors,
      rowGaps,
    );
    if (bottom > maxBottom) maxBottom = bottom;
  });

  // Trailing band for unplaced visible children (§1.4).
  const extraBands: ComposedTrackLine[] = [];
  let totalWidth = stageAndPeripheralWidth;
  if (unplaced.length > 0) {
    const trailing = layoutTrailingBand(runKey, unplaced, sizeOf, isContainer, isExpandedContainer, rowGaps, zoneGutter, widen);
    let trailingTop = maxBottom;
    if (maxBottom > 0) {
      const prevHasZone = bandCount > 0 ? bandHasContainer[bandCount - 1]! : false;
      const z = prevHasZone || trailing.hasContainer;
      const gapId = `${runKey}|across|__trailing__`;
      const { gap, base } = resolveBoundaryGap(gapId, z, rowGaps.cardY, zoneGutter, rowGaps.maxY, widen);
      const gy = maxBottom;
      const stripW = Math.max(stageAndPeripheralWidth, trailing.width);
      gutterCollectors.push((originX, originY) => ({
        id: gapId,
        horizontal: true,
        strips: stripW > 0 ? [{ x: originX, y: originY + gy, width: stripW, height: gap }] : [],
        gap,
        base,
        authoredBase: false,
        max: rowGaps.maxY,
        zone: z,
      }));
      trailingTop += gap;
    }
    const trailingBandIdx = bandCount;
    for (const item of trailing.items) {
      const align = effectiveAlign(undefined, item.isExpanded);
      const alignedY = alignWithin(trailingTop, trailing.height, item.height, align, item.isExpanded);
      placements.push({
        entity: item.entity,
        relX: clean(item.relX),
        relY: clean(alignedY.pos),
        width: item.width,
        height: alignedY.size,
        slotRelRect: { x: clean(item.relX), y: clean(trailingTop), width: item.width, height: trailing.height },
        stretchX: false,
        stretchY: alignedY.stretched,
        isPeripheral: false,
        colStart: -1,
        colEnd: -1,
        bandStart: trailingBandIdx,
        bandEnd: trailingBandIdx,
      });
    }
    for (const g of trailing.gaps) {
      gutterCollectors.push((originX, originY) => ({
        id: g.id,
        horizontal: false,
        strips: [{ x: originX + g.startX, y: originY + trailingTop, width: g.gap, height: trailing.height }],
        gap: g.gap,
        base: g.base,
        authoredBase: false,
        max: rowGaps.maxX,
        zone: g.zone,
      }));
    }
    extraBands.push({ id: "__trailing__", kind: "trailing", start: trailingTop, size: trailing.height });
    maxBottom = trailingTop + trailing.height;
    totalWidth = Math.max(totalWidth, trailing.width);
  }

  // Emit column boundary gutters with contiguous uncrossed strips (§4.1 & §4.3 step 8).
  for (let i = 0; i < colBoundaryInfo.length; i += 1) {
    const info = colBoundaryInfo[i]!;
    const gx = colStarts[i]! + colWidths[i]!;
    const leftCol = allCols[i]!;
    const rightCol = allCols[i + 1]!;
    const isStageBoundary = leftCol.kind === "stage" && rightCol.kind === "stage";
    const leftStageIdx = leftCol.stageIndex;
    gutterCollectors.push((originX, originY) => {
      const strips: Rect[] = [];
      let runTop: number | undefined;
      let runBottom: number | undefined;
      const flush = () => {
        if (runTop !== undefined && runBottom !== undefined && runBottom > runTop) {
          strips.push({ x: originX + gx, y: originY + runTop, width: info.gap, height: runBottom - runTop });
        }
        runTop = undefined;
        runBottom = undefined;
      };
      for (let b = 0; b < bandCount; b += 1) {
        const bh = bandHeights[b]!;
        const crossed =
          isStageBoundary &&
          leftStageIdx !== undefined &&
          activeCells.some(
            (c) => c.colStart <= leftStageIdx && c.colEnd >= leftStageIdx + 1 && c.bandStart <= b && c.bandEnd >= b,
          );
        if (crossed) {
          flush();
          continue;
        }
        if (!(bh > 0)) continue;
        if (runTop === undefined) runTop = bandStarts[b]!;
        runBottom = bandStarts[b]! + bh;
      }
      // If a peripheral column adjacent to this boundary extends past the last band, extend the strip.
      if (!isStageBoundary && maxBottom > declaredBandsBottom) {
        const stripBottom = Math.max(
          leftCol.peripheral !== undefined
            ? (bandCount > 0 ? bandStarts[leftCol.peripheral.fromBandActive]! : 0) + leftCol.peripheral.naturalHeight
            : declaredBandsBottom,
          rightCol.peripheral !== undefined
            ? (bandCount > 0 ? bandStarts[rightCol.peripheral.fromBandActive]! : 0) + rightCol.peripheral.naturalHeight
            : declaredBandsBottom,
        );
        if (stripBottom > declaredBandsBottom) {
          if (runTop === undefined) runTop = declaredBandsBottom;
          runBottom = Math.max(runBottom ?? declaredBandsBottom, stripBottom);
        }
      }
      flush();
      return {
        id: info.id,
        horizontal: false,
        strips,
        gap: info.gap,
        base: info.base,
        authoredBase: false,
        max: rowGaps.maxX,
        zone: info.zone,
      };
    });
  }

  // Emit band boundary gutters with contiguous uncrossed strips (§4.1 & §4.3 step 8).
  for (let j = 0; j < bandBoundaryInfo.length; j += 1) {
    const info = bandBoundaryInfo[j]!;
    const gy = bandStarts[j]! + bandHeights[j]!;
    gutterCollectors.push((originX, originY) => {
      const strips: Rect[] = [];
      let runLeft: number | undefined;
      let runRight: number | undefined;
      const flush = () => {
        if (runLeft !== undefined && runRight !== undefined && runRight > runLeft) {
          strips.push({ x: originX + runLeft, y: originY + gy, width: runRight - runLeft, height: info.gap });
        }
        runLeft = undefined;
        runRight = undefined;
      };
      for (let s = 0; s < stageCount; s += 1) {
        const cw = stageWidths[s]!;
        const crossed = activeCells.some(
          (c) => c.bandStart <= j && c.bandEnd >= j + 1 && c.colStart <= s && c.colEnd >= s,
        );
        if (crossed) {
          flush();
          continue;
        }
        if (!(cw > 0)) continue;
        const leftX = colStarts[colOffset + s]!;
        if (runLeft === undefined) runLeft = leftX;
        runRight = leftX + cw;
      }
      flush();
      return {
        id: info.id,
        horizontal: true,
        strips,
        gap: info.gap,
        base: info.base,
        authoredBase: false,
        max: rowGaps.maxY,
        zone: info.zone,
      };
    });
  }

  const columns: ComposedTrackLine[] = allCols.map((col, idx) => ({
    id: col.id,
    kind: col.kind,
    start: colStarts[idx]!,
    size: colWidths[idx]!,
  }));
  const bands: ComposedTrackLine[] = [
    ...activeBandDeclIndices.map((declIdx, activeIdx) => ({
      id: grid.transverse_bands[declIdx]!.id,
      kind: "band" as const,
      start: bandStarts[activeIdx]!,
      size: bandHeights[activeIdx]!,
    })),
    ...extraBands,
  ];

  return {
    scope,
    runKey,
    width: totalWidth,
    height: maxBottom,
    columns,
    bands,
    placements,
    unplaced,
    emitGutters: (originX, originY) => gutterCollectors.map((fn) => fn(originX, originY)),
    toReport: (originX, originY) => ({
      scope,
      runKey,
      columns: columns.map((c) => ({ ...c, start: clean(originX + c.start) })),
      bands: bands.map((b) => ({ ...b, start: clean(originY + b.start) })),
      cells: placements.map((p) => ({
        entity: p.entity,
        slotRect: {
          x: clean(originX + p.slotRelRect.x),
          y: clean(originY + p.slotRelRect.y),
          width: p.slotRelRect.width,
          height: p.slotRelRect.height,
        },
        boxRect: {
          x: clean(originX + p.relX),
          y: clean(originY + p.relY),
          width: p.width,
          height: p.height,
        },
        colStart: p.colStart,
        colEnd: p.colEnd,
        bandStart: p.bandStart,
        bandEnd: p.bandEnd,
      })),
    }),
  };
}

function layoutUnstagedGrid(args: {
  readonly scope: string;
  readonly runKey: string;
  readonly grid: LayoutGrid;
  readonly visibleSet: ReadonlySet<EntityRef>;
  readonly unplaced: readonly EntityRef[];
  readonly startPeripheralsRaw: readonly LayoutPeripheralColumn[];
  readonly endPeripheralsRaw: readonly LayoutPeripheralColumn[];
  readonly buildPeripheral: (
    col: LayoutPeripheralColumn,
    declBandToActive: ReadonlyMap<number, number>,
    activeBandCount: number,
  ) => ActivePeripheral | undefined;
  readonly sizeOf: (entity: EntityRef) => { readonly width: number; readonly height: number };
  readonly isContainer: (entity: EntityRef) => boolean;
  readonly isExpandedContainer: (entity: EntityRef) => boolean;
  readonly rowGaps: ResolvedRowGaps;
  readonly zoneGutter: number;
  readonly widen?: ReadonlyMap<string, number> | undefined;
  readonly sigmaCols?: ReadonlyMap<string, number> | undefined;
  readonly sigmaBands?: ReadonlyMap<string, number> | undefined;
}): GridLayoutResult {
  const {
    scope,
    runKey,
    grid,
    visibleSet,
    unplaced,
    startPeripheralsRaw,
    endPeripheralsRaw,
    buildPeripheral,
    sizeOf,
    isContainer,
    isExpandedContainer,
    rowGaps,
    zoneGutter,
    widen,
    sigmaCols,
    sigmaBands,
  } = args;

  interface MeasuredBand {
    readonly declIdx: number;
    readonly id: string;
    readonly items: readonly {
      readonly entity: EntityRef;
      readonly width: number;
      readonly height: number;
      readonly isContainer: boolean;
      readonly isExpanded: boolean;
      readonly align: LayoutCellAlign;
      readonly relX: number;
    }[];
    readonly intraGaps: readonly { readonly id: string; readonly startX: number; readonly gap: number; readonly base: number; readonly zone: boolean }[];
    readonly width: number;
    readonly height: number;
    readonly hasContainer: boolean;
  }

  const activeBands: MeasuredBand[] = [];
  const declBandToActive = new Map<number, number>();
  grid.transverse_bands.forEach((band, declIdx) => {
    const visibleItems = band.items.filter((item) => visibleSet.has(item));
    if (visibleItems.length === 0) return;
    declBandToActive.set(declIdx, activeBands.length);
    const measured = visibleItems.map((entity) => {
      const sz = sizeOf(entity);
      const exp = isExpandedContainer(entity);
      const cell = grid.cells?.[entity];
      return {
        entity,
        width: sz.width,
        height: sz.height,
        isContainer: isContainer(entity),
        isExpanded: exp,
        align: effectiveAlign(cell?.align, exp),
      };
    });
    let cursorX = 0;
    let maxH = 0;
    const positioned: MeasuredBand["items"][number][] = [];
    const intraGaps: MeasuredBand["intraGaps"][number][] = [];
    measured.forEach((item, idx) => {
      maxH = Math.max(maxH, item.height);
      positioned.push({ ...item, relX: cursorX });
      cursorX += item.width;
      const next = measured[idx + 1];
      if (next !== undefined) {
        const z = item.isContainer || next.isContainer;
        const id = `${runKey}|along|${band.id}|${String(idx)}`;
        const { gap, base } = resolveBoundaryGap(id, z, rowGaps.cardX, zoneGutter, rowGaps.maxX, widen);
        intraGaps.push({ id, startX: cursorX, gap, base, zone: z });
        cursorX += gap;
      }
    });
    const sigmaAdd = sigmaBands?.get(band.id) ?? 0;
    activeBands.push({
      declIdx,
      id: band.id,
      items: positioned,
      intraGaps,
      width: cursorX,
      height: maxH + (sigmaAdd > 0 ? sigmaAdd : 0),
      hasContainer: measured.some((item) => item.isContainer),
    });
  });

  const startPeripherals = startPeripheralsRaw
    .map((col) => buildPeripheral(col, declBandToActive, activeBands.length))
    .filter((p): p is ActivePeripheral => p !== undefined);
  const endPeripherals = endPeripheralsRaw
    .map((col) => buildPeripheral(col, declBandToActive, activeBands.length))
    .filter((p): p is ActivePeripheral => p !== undefined);

  const mainSigmaX = sigmaCols?.get("__main__") ?? 0;
  const mainWidth = (activeBands.length > 0 ? Math.max(...activeBands.map((b) => b.width)) : 0) + (mainSigmaX > 0 ? mainSigmaX : 0);
  const mainHasContainer = activeBands.some((b) => b.hasContainer);

  interface ColMeta {
    readonly id: string;
    readonly kind: "peripheral-start" | "stage" | "peripheral-end";
    readonly width: number;
    readonly hasContainer: boolean;
    readonly peripheral?: ActivePeripheral;
  }
  const allCols: ColMeta[] = [
    ...startPeripherals.map((p) => ({
      id: p.column.id,
      kind: "peripheral-start" as const,
      width: p.width,
      hasContainer: p.hasContainer,
      peripheral: p,
    })),
    ...(activeBands.length > 0
      ? [{ id: "__main__", kind: "stage" as const, width: mainWidth, hasContainer: mainHasContainer }]
      : []),
    ...endPeripherals.map((p) => ({
      id: p.column.id,
      kind: "peripheral-end" as const,
      width: p.width,
      hasContainer: p.hasContainer,
      peripheral: p,
    })),
  ];

  const colBoundaryInfo: { readonly id: string; readonly gap: number; readonly base: number; readonly zone: boolean }[] = [];
  for (let i = 0; i < allCols.length - 1; i += 1) {
    const z = allCols[i]!.hasContainer || allCols[i + 1]!.hasContainer;
    const id = `${runKey}|along|${allCols[i]!.id}`;
    const { gap, base } = resolveBoundaryGap(id, z, rowGaps.cardX, zoneGutter, rowGaps.maxX, widen);
    colBoundaryInfo.push({ id, gap, base, zone: z });
  }

  const colStarts: number[] = [];
  let cursorX = 0;
  for (let i = 0; i < allCols.length; i += 1) {
    colStarts.push(cursorX);
    cursorX += allCols[i]!.width;
    if (i < colBoundaryInfo.length) cursorX += colBoundaryInfo[i]!.gap;
  }
  const mainColIdx = allCols.findIndex((c) => c.kind === "stage");
  const mainOriginX = mainColIdx >= 0 ? colStarts[mainColIdx]! : 0;

  const bandBoundaryInfo: { readonly id: string; readonly gap: number; readonly base: number; readonly zone: boolean }[] = [];
  const bandStarts: number[] = [];
  let cursorY = 0;
  for (let j = 0; j < activeBands.length; j += 1) {
    bandStarts.push(cursorY);
    cursorY += activeBands[j]!.height;
    if (j < activeBands.length - 1) {
      const z = activeBands[j]!.hasContainer || activeBands[j + 1]!.hasContainer;
      const id = `${runKey}|across|${activeBands[j]!.id}`;
      const { gap, base } = resolveBoundaryGap(id, z, rowGaps.cardY, zoneGutter, rowGaps.maxY, widen);
      bandBoundaryInfo.push({ id, gap, base, zone: z });
      cursorY += gap;
    }
  }
  const declaredBandsBottom = cursorY;

  const placements: ComposedCellPlacement[] = [];
  const gutterCollectors: ((originX: number, originY: number) => ComposedGutter)[] = [];

  activeBands.forEach((band, bandIdx) => {
    const by = bandStarts[bandIdx]!;
    for (const item of band.items) {
      const alignedY = alignWithin(by, band.height, item.height, item.align, item.isExpanded);
      placements.push({
        entity: item.entity,
        relX: clean(mainOriginX + item.relX),
        relY: clean(alignedY.pos),
        width: item.width,
        height: alignedY.size,
        slotRelRect: { x: clean(mainOriginX + item.relX), y: clean(by), width: item.width, height: band.height },
        stretchX: false,
        stretchY: alignedY.stretched,
        isPeripheral: false,
        colStart: mainColIdx,
        colEnd: mainColIdx,
        bandStart: bandIdx,
        bandEnd: bandIdx,
      });
    }
    for (const g of band.intraGaps) {
      gutterCollectors.push((originX, originY) => ({
        id: g.id,
        horizontal: false,
        strips: [{ x: originX + mainOriginX + g.startX, y: originY + by, width: g.gap, height: band.height }],
        gap: g.gap,
        base: g.base,
        authoredBase: false,
        max: rowGaps.maxX,
        zone: g.zone,
      }));
    }
  });

  for (let j = 0; j < bandBoundaryInfo.length; j += 1) {
    const info = bandBoundaryInfo[j]!;
    const gy = bandStarts[j]! + activeBands[j]!.height;
    gutterCollectors.push((originX, originY) => ({
      id: info.id,
      horizontal: true,
      strips: mainWidth > 0 ? [{ x: originX + mainOriginX, y: originY + gy, width: mainWidth, height: info.gap }] : [],
      gap: info.gap,
      base: info.base,
      authoredBase: false,
      max: rowGaps.maxY,
      zone: info.zone,
    }));
  }

  let maxBottom = declaredBandsBottom;
  allCols.forEach((col, fullColIdx) => {
    if (col.peripheral === undefined) return;
    const topY = activeBands.length > 0 ? bandStarts[col.peripheral.fromBandActive]! : 0;
    const bottom = placePeripheralItems(
      col.peripheral,
      colStarts[fullColIdx]!,
      fullColIdx,
      topY,
      declaredBandsBottom,
      Math.max(0, activeBands.length - 1),
      placements,
      gutterCollectors,
      rowGaps,
    );
    if (bottom > maxBottom) maxBottom = bottom;
  });

  for (let i = 0; i < colBoundaryInfo.length; i += 1) {
    const info = colBoundaryInfo[i]!;
    const gx = colStarts[i]! + allCols[i]!.width;
    gutterCollectors.push((originX, originY) => ({
      id: info.id,
      horizontal: false,
      strips: maxBottom > 0 ? [{ x: originX + gx, y: originY, width: info.gap, height: maxBottom }] : [],
      gap: info.gap,
      base: info.base,
      authoredBase: false,
      max: rowGaps.maxX,
      zone: info.zone,
    }));
  }

  const extraBands: ComposedTrackLine[] = [];
  let totalWidth = cursorX;
  if (unplaced.length > 0) {
    const trailing = layoutTrailingBand(runKey, unplaced, sizeOf, isContainer, isExpandedContainer, rowGaps, zoneGutter, widen);
    let trailingTop = maxBottom;
    if (maxBottom > 0) {
      const prevHasZone = activeBands.length > 0 ? activeBands[activeBands.length - 1]!.hasContainer : false;
      const z = prevHasZone || trailing.hasContainer;
      const gapId = `${runKey}|across|__trailing__`;
      const { gap, base } = resolveBoundaryGap(gapId, z, rowGaps.cardY, zoneGutter, rowGaps.maxY, widen);
      const gy = maxBottom;
      const stripW = Math.max(totalWidth, trailing.width);
      gutterCollectors.push((originX, originY) => ({
        id: gapId,
        horizontal: true,
        strips: stripW > 0 ? [{ x: originX, y: originY + gy, width: stripW, height: gap }] : [],
        gap,
        base,
        authoredBase: false,
        max: rowGaps.maxY,
        zone: z,
      }));
      trailingTop += gap;
    }
    const trailingBandIdx = activeBands.length;
    for (const item of trailing.items) {
      const align = effectiveAlign(undefined, item.isExpanded);
      const alignedY = alignWithin(trailingTop, trailing.height, item.height, align, item.isExpanded);
      placements.push({
        entity: item.entity,
        relX: clean(item.relX),
        relY: clean(alignedY.pos),
        width: item.width,
        height: alignedY.size,
        slotRelRect: { x: clean(item.relX), y: clean(trailingTop), width: item.width, height: trailing.height },
        stretchX: false,
        stretchY: alignedY.stretched,
        isPeripheral: false,
        colStart: -1,
        colEnd: -1,
        bandStart: trailingBandIdx,
        bandEnd: trailingBandIdx,
      });
    }
    for (const g of trailing.gaps) {
      gutterCollectors.push((originX, originY) => ({
        id: g.id,
        horizontal: false,
        strips: [{ x: originX + g.startX, y: originY + trailingTop, width: g.gap, height: trailing.height }],
        gap: g.gap,
        base: g.base,
        authoredBase: false,
        max: rowGaps.maxX,
        zone: g.zone,
      }));
    }
    extraBands.push({ id: "__trailing__", kind: "trailing", start: trailingTop, size: trailing.height });
    maxBottom = trailingTop + trailing.height;
    totalWidth = Math.max(totalWidth, trailing.width);
  }

  const columns: ComposedTrackLine[] = allCols.map((c, i) => ({
    id: c.id,
    kind: c.kind,
    start: colStarts[i]!,
    size: c.width,
  }));
  const bands: ComposedTrackLine[] = [
    ...activeBands.map((b, j) => ({ id: b.id, kind: "band" as const, start: bandStarts[j]!, size: b.height })),
    ...extraBands,
  ];

  return {
    scope,
    runKey,
    width: totalWidth,
    height: maxBottom,
    columns,
    bands,
    placements,
    unplaced,
    emitGutters: (originX, originY) => gutterCollectors.map((fn) => fn(originX, originY)),
    toReport: (originX, originY) => ({
      scope,
      runKey,
      columns: columns.map((c) => ({ ...c, start: clean(originX + c.start) })),
      bands: bands.map((b) => ({ ...b, start: clean(originY + b.start) })),
      cells: placements.map((p) => ({
        entity: p.entity,
        slotRect: {
          x: clean(originX + p.slotRelRect.x),
          y: clean(originY + p.slotRelRect.y),
          width: p.slotRelRect.width,
          height: p.slotRelRect.height,
        },
        boxRect: {
          x: clean(originX + p.relX),
          y: clean(originY + p.relY),
          width: p.width,
          height: p.height,
        },
        colStart: p.colStart,
        colEnd: p.colEnd,
        bandStart: p.bandStart,
        bandEnd: p.bandEnd,
      })),
    }),
  };
}

/** Lay out a single-line container stack (never wraps into shelves, §1.4). */
export function layoutStackScope(input: StackLayoutInput): StackLayoutResult {
  const { scope, runKey, stack, visibleChildren, sizeOf, isContainer, isExpandedContainer, rowGaps, zoneGutter, widen } = input;
  const horizontal = stack.axis === "row";
  const crossAlign = stack.align ?? "start";
  const measured = visibleChildren.map((entity) => {
    const sz = sizeOf(entity);
    return {
      entity,
      width: sz.width,
      height: sz.height,
      isContainer: isContainer(entity),
      isExpanded: isExpandedContainer(entity),
    };
  });
  if (measured.length === 0) {
    return { scope, runKey, axis: stack.axis, width: 0, height: 0, placements: [], emitGutters: () => [] };
  }
  const crossSize = Math.max(...measured.map((item) => (horizontal ? item.height : item.width)));
  const placements: StackLayoutResult["placements"][number][] = [];
  const gutterSpecs: { readonly id: string; readonly start: number; readonly gap: number; readonly base: number; readonly zone: boolean }[] = [];
  let cursor = 0;
  measured.forEach((item, idx) => {
    const effectiveCross = effectiveAlign(crossAlign, item.isExpanded);
    const alignedCross = alignWithin(0, crossSize, horizontal ? item.height : item.width, effectiveCross, item.isExpanded);
    placements.push({
      entity: item.entity,
      relX: clean(horizontal ? cursor : alignedCross.pos),
      relY: clean(horizontal ? alignedCross.pos : cursor),
      width: horizontal ? item.width : alignedCross.size,
      height: horizontal ? alignedCross.size : item.height,
      stretchX: !horizontal && alignedCross.stretched,
      stretchY: horizontal && alignedCross.stretched,
    });
    cursor += horizontal ? item.width : item.height;
    const next = measured[idx + 1];
    if (next !== undefined) {
      const z = item.isContainer || next.isContainer;
      const id = `${runKey}|${horizontal ? "along" : "across"}|${String(idx)}`;
      const { gap, base } = resolveBoundaryGap(
        id,
        z,
        horizontal ? rowGaps.cardX : rowGaps.cardY,
        zoneGutter,
        horizontal ? rowGaps.maxX : rowGaps.maxY,
        widen,
      );
      gutterSpecs.push({ id, start: cursor, gap, base, zone: z });
      cursor += gap;
    }
  });
  const width = horizontal ? cursor : crossSize;
  const height = horizontal ? crossSize : cursor;
  return {
    scope,
    runKey,
    axis: stack.axis,
    width,
    height,
    placements,
    emitGutters: (originX, originY) =>
      gutterSpecs.map((g) => ({
        id: g.id,
        horizontal: !horizontal,
        strips: [
          horizontal
            ? { x: originX + g.start, y: originY, width: g.gap, height: crossSize }
            : { x: originX, y: originY + g.start, width: crossSize, height: g.gap },
        ],
        gap: g.gap,
        base: g.base,
        authoredBase: false,
        max: horizontal ? rowGaps.maxX : rowGaps.maxY,
        zone: g.zone,
      })),
  };
}
