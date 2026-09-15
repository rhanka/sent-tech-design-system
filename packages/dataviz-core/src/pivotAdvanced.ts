/**
 * Advanced pivot data contracts.
 *
 * This module keeps the existing flat pivot table contract stable and adds a
 * hierarchical, metadata-rich shape for subtotals, collapsed paths, cell heat
 * and in-cell sparklines.
 */

import { aggregate, groupAggregate } from './aggregate.js';
import { findDimension, findMeasure } from './model.js';
import type { DataModel, Measure, Row } from './model.js';
import type { PivotTableColumn } from './pivot.js';

export interface AdvancedPivotConfig {
  rows: string[];
  columns?: string[];
  measures: string[];
  includeSubtotals?: boolean;
  collapsedRowPaths?: readonly string[];
  heatmap?: boolean;
  sparklineDimension?: string;
}

export interface AdvancedPivotSparklinePoint {
  key: string;
  value: number;
}

export interface AdvancedPivotCell {
  key: string;
  measureId: string;
  value: number;
  columnKey?: string;
  columnLabel?: string;
  heat?: number;
  sparkline?: AdvancedPivotSparklinePoint[];
}

export interface AdvancedPivotRow {
  id: string;
  path: string[];
  labels: Record<string, string>;
  kind: 'leaf' | 'subtotal';
  depth: number;
  expanded: boolean;
  values: Record<string, AdvancedPivotCell>;
}

export interface AdvancedPivotTable {
  columns: PivotTableColumn[];
  rows: AdvancedPivotRow[];
  heatDomain?: [number, number];
}

interface RowNodeDraft {
  id: string;
  path: string[];
  rows: Row[];
  kind: 'leaf' | 'subtotal';
}

function cellKey(value: unknown): string {
  return value == null ? 'null' : String(value);
}

function pathFor(row: Row, dimensions: readonly string[]): string[] {
  return dimensions.map((dimensionId) => cellKey(row[dimensionId]));
}

function pathKey(path: readonly string[]): string {
  return path.join('\u001f');
}

function pathLabel(path: readonly string[]): string {
  return path.join(' / ');
}

function hasPathPrefix(path: readonly string[], prefix: readonly string[]): boolean {
  if (path.length <= prefix.length) return false;
  return prefix.every((segment, index) => path[index] === segment);
}

function assertDimensions(model: DataModel, ids: readonly string[], role: 'row' | 'column'): void {
  for (const id of ids) {
    if (!findDimension(model, id)) {
      throw new Error(`Unknown advanced pivot ${role} dimension: ${id}`);
    }
  }
}

function resolveMeasures(model: DataModel, ids: readonly string[]): Measure[] {
  return ids.map((id) => {
    const measure = findMeasure(model, id);
    if (!measure) {
      throw new Error(`Unknown advanced pivot measure: ${id}`);
    }
    return measure;
  });
}

function assertSparklineDimension(model: DataModel, id: string | undefined): void {
  if (id !== undefined && !findDimension(model, id)) {
    throw new Error(`Unknown advanced pivot sparkline dimension: ${id}`);
  }
}

function columnPathsFor(data: readonly Row[], columns: readonly string[]): Map<string, string[]> {
  const paths = new Map<string, string[]>();
  if (columns.length === 0) return paths;

  for (const row of data) {
    const path = pathFor(row, columns);
    const id = pathKey(path);
    if (!paths.has(id)) {
      paths.set(id, path);
    }
  }

  return paths;
}

function buildColumns(
  model: DataModel,
  rowDimensions: readonly string[],
  columnPaths: ReadonlyMap<string, string[]>,
  measures: readonly Measure[],
): PivotTableColumn[] {
  const columns: PivotTableColumn[] = rowDimensions.map((dimensionId) => ({
    key: `row:${dimensionId}`,
    label: findDimension(model, dimensionId)!.label,
    kind: 'row',
  }));

  if (columnPaths.size === 0) {
    for (const measure of measures) {
      columns.push({
        key: `value:${measure.id}`,
        label: measure.label,
        kind: 'value',
        measureId: measure.id,
      });
    }
    return columns;
  }

  for (const [columnKey, columnPath] of columnPaths) {
    const columnLabel = pathLabel(columnPath);
    for (const measure of measures) {
      columns.push({
        key: `value:${columnKey}:${measure.id}`,
        label: `${columnLabel} · ${measure.label}`,
        kind: 'value',
        columnKey,
        columnLabel,
        measureId: measure.id,
      });
    }
  }

  return columns;
}

function collectRowNodes(
  data: readonly Row[],
  rowDimensions: readonly string[],
  includeSubtotals: boolean,
): RowNodeDraft[] {
  const nodes = new Map<string, RowNodeDraft>();

  for (const row of data) {
    for (let depth = 1; depth <= rowDimensions.length; depth += 1) {
      if (!includeSubtotals && depth < rowDimensions.length) continue;

      const path = pathFor(row, rowDimensions.slice(0, depth));
      const id = pathKey(path);
      const kind = depth === rowDimensions.length ? 'leaf' : 'subtotal';
      const node = nodes.get(id);
      if (node) {
        node.rows.push(row);
      } else {
        nodes.set(id, { id, path, rows: [row], kind });
      }
    }
  }

  return [...nodes.values()];
}

function matchesColumnPath(row: Row, columns: readonly string[], path: readonly string[]): boolean {
  return pathFor(row, columns).every((value, index) => value === path[index]);
}

function labelsFor(path: readonly string[], rowDimensions: readonly string[]): Record<string, string> {
  const labels: Record<string, string> = {};
  path.forEach((label, index) => {
    labels[rowDimensions[index]!] = label;
  });
  return labels;
}

function valueKey(columnKey: string | undefined, measure: Measure): string {
  return columnKey === undefined ? `value:${measure.id}` : `value:${columnKey}:${measure.id}`;
}

function buildValues(
  rows: readonly Row[],
  columnDimensions: readonly string[],
  columnPaths: ReadonlyMap<string, string[]>,
  measures: readonly Measure[],
  sparklineDimension: string | undefined,
): Record<string, AdvancedPivotCell> {
  const values: Record<string, AdvancedPivotCell> = {};

  if (columnPaths.size === 0) {
    for (const measure of measures) {
      const key = valueKey(undefined, measure);
      values[key] = {
        key,
        measureId: measure.id,
        value: aggregate([...rows], measure),
      };
      if (sparklineDimension !== undefined) {
        values[key].sparkline = groupAggregate([...rows], sparklineDimension, measure);
      }
    }
    return values;
  }

  for (const [columnKey, columnPath] of columnPaths) {
    const bucket = rows.filter((row) => matchesColumnPath(row, columnDimensions, columnPath));
    const columnLabel = pathLabel(columnPath);
    for (const measure of measures) {
      const key = valueKey(columnKey, measure);
      values[key] = {
        key,
        measureId: measure.id,
        columnKey,
        columnLabel,
        value: aggregate(bucket, measure),
      };
      if (sparklineDimension !== undefined) {
        values[key].sparkline = groupAggregate(bucket, sparklineDimension, measure);
      }
    }
  }

  return values;
}

function applyHeat(rows: AdvancedPivotRow[]): [number, number] | undefined {
  const cells = rows.flatMap((row) => Object.values(row.values));
  const finite = cells.map((cell) => cell.value).filter(Number.isFinite);
  if (finite.length === 0) return undefined;

  const min = Math.min(...finite);
  const max = Math.max(...finite);
  const span = max - min;

  for (const cell of cells) {
    cell.heat = span === 0 ? 1 : (cell.value - min) / span;
  }

  return [min, max];
}

function visibleNodes(
  nodes: readonly RowNodeDraft[],
  collapsedRowPaths: readonly string[],
): RowNodeDraft[] {
  const collapsed = collapsedRowPaths.map((id) => id.split('\u001f'));
  return nodes.filter((node) => !collapsed.some((path) => hasPathPrefix(node.path, path)));
}

export function buildAdvancedPivotTable(
  model: DataModel,
  data: readonly Row[],
  config: AdvancedPivotConfig,
): AdvancedPivotTable {
  if (config.rows.length === 0) {
    throw new Error('Advanced pivot requires at least one row dimension');
  }
  if (config.measures.length === 0) {
    throw new Error('Advanced pivot requires at least one measure');
  }

  const columnDimensions = config.columns ?? [];
  assertDimensions(model, config.rows, 'row');
  assertDimensions(model, columnDimensions, 'column');
  assertSparklineDimension(model, config.sparklineDimension);
  const measures = resolveMeasures(model, config.measures);
  const columnPaths = columnPathsFor(data, columnDimensions);

  const draftRows = visibleNodes(
    collectRowNodes(data, config.rows, config.includeSubtotals ?? false),
    config.collapsedRowPaths ?? [],
  );

  const rows: AdvancedPivotRow[] = draftRows.map((node) => ({
    id: node.id,
    path: node.path,
    labels: labelsFor(node.path, config.rows),
    kind: node.kind,
    depth: node.path.length - 1,
    expanded: node.kind === 'subtotal' && !(config.collapsedRowPaths ?? []).includes(node.id),
    values: buildValues(
      node.rows,
      columnDimensions,
      columnPaths,
      measures,
      config.sparklineDimension,
    ),
  }));

  const heatDomain = config.heatmap ? applyHeat(rows) : undefined;

  return {
    columns: buildColumns(model, config.rows, columnPaths, measures),
    rows,
    ...(heatDomain ? { heatDomain } : {}),
  };
}
