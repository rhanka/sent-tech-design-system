/**
 * Pivot / matrix aggregation.
 *
 * The output is intentionally presentation-neutral but shaped for DS DataTable:
 * a column list with stable keys and row objects carrying those keys.
 */

import { aggregate } from './aggregate.js';
import { findDimension, findMeasure } from './model.js';
import type { DataModel, Measure, Row } from './model.js';

export interface PivotConfig {
  rows: string[];
  columns?: string[];
  measures: string[];
}

export interface PivotTableColumn {
  key: string;
  label: string;
  kind: 'row' | 'value';
  dimensionId?: string;
  columnKey?: string;
  columnLabel?: string;
  measureId?: string;
}

export interface PivotTableRow {
  id: string;
  [key: string]: string | number;
}

export interface PivotTable {
  columns: PivotTableColumn[];
  rows: PivotTableRow[];
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

function assertDimensions(model: DataModel, ids: readonly string[], role: 'row' | 'column'): void {
  for (const id of ids) {
    if (!findDimension(model, id)) {
      throw new Error(`Unknown pivot ${role} dimension: ${id}`);
    }
  }
}

function resolveMeasures(model: DataModel, ids: readonly string[]): Measure[] {
  return ids.map((id) => {
    const measure = findMeasure(model, id);
    if (!measure) {
      throw new Error(`Unknown pivot measure: ${id}`);
    }
    return measure;
  });
}

export function buildPivotTable(
  model: DataModel,
  data: readonly Row[],
  config: PivotConfig,
): PivotTable {
  if (config.rows.length === 0) {
    throw new Error('Pivot requires at least one row dimension');
  }
  if (config.measures.length === 0) {
    throw new Error('Pivot requires at least one measure');
  }

  const columnDimensions = config.columns ?? [];
  assertDimensions(model, config.rows, 'row');
  assertDimensions(model, columnDimensions, 'column');
  const measures = resolveMeasures(model, config.measures);

  const rowGroups = new Map<string, { path: string[]; rows: Row[] }>();
  const columnPaths = new Map<string, string[]>();

  for (const row of data) {
    const rowPath = pathFor(row, config.rows);
    const rowId = pathKey(rowPath);
    const rowGroup = rowGroups.get(rowId);
    if (rowGroup) {
      rowGroup.rows.push(row);
    } else {
      rowGroups.set(rowId, { path: rowPath, rows: [row] });
    }

    if (columnDimensions.length > 0) {
      const columnPath = pathFor(row, columnDimensions);
      const columnKey = pathKey(columnPath);
      if (!columnPaths.has(columnKey)) {
        columnPaths.set(columnKey, columnPath);
      }
    }
  }

  const columns: PivotTableColumn[] = config.rows.map((dimensionId) => ({
    key: `row:${dimensionId}`,
    label: findDimension(model, dimensionId)!.label,
    kind: 'row',
  }));

  if (columnDimensions.length === 0) {
    for (const measure of measures) {
      columns.push({
        key: `value:${measure.id}`,
        label: measure.label,
        kind: 'value',
        measureId: measure.id,
      });
    }
  } else {
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
  }

  const rows: PivotTableRow[] = [];
  for (const [rowId, group] of rowGroups) {
    const out: PivotTableRow = { id: rowId };
    config.rows.forEach((dimensionId, index) => {
      out[`row:${dimensionId}`] = group.path[index] ?? 'null';
    });

    if (columnDimensions.length === 0) {
      for (const measure of measures) {
        out[`value:${measure.id}`] = aggregate(group.rows, measure);
      }
    } else {
      for (const [columnKey, columnPath] of columnPaths) {
        const bucket = group.rows.filter((row) => pathKey(pathFor(row, columnDimensions)) === columnKey);
        for (const measure of measures) {
          out[`value:${pathKey(columnPath)}:${measure.id}`] = aggregate(bucket, measure);
        }
      }
    }

    rows.push(out);
  }

  return { columns, rows };
}
