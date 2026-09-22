/**
 * Part-of-whole, waterfall and flow data contracts.
 *
 * These builders stay rendering-agnostic while covering the data shapes needed
 * by pie/donut/funnel, treemap/sunburst, waterfall, sankey/chord, radar and
 * rose, Mekko and packed bubble renderers.
 */

import { aggregate } from './aggregate.js';
import { findDimension, findMeasure } from './model.js';
import type { DataModel, Measure, Row } from './model.js';

export type PartWholeSort = 'input' | 'value-asc' | 'value-desc';

export interface PartWholeConfig {
  category: string;
  measure: string;
  sort?: PartWholeSort;
}

export interface PartWholeItem {
  key: string;
  label: string;
  value: number;
  percent: number;
  cumulativeValue: number;
  cumulativePercent: number;
}

export interface PartWholeModel {
  total: number;
  items: PartWholeItem[];
}

export interface PartWholeHierarchyConfig {
  hierarchy: string[];
  measure: string;
}

export interface PartWholeNode {
  key: string;
  label: string;
  value: number;
  children?: PartWholeNode[];
}

export interface WaterfallConfig {
  category: string;
  measure: string;
  totalLabel?: string;
}

export interface WaterfallStep {
  key: string;
  label: string;
  kind: 'delta' | 'total';
  delta: number;
  start: number;
  end: number;
}

export interface WaterfallModel {
  total: number;
  steps: WaterfallStep[];
}

export interface FlowConfig {
  source: string;
  target: string;
  measure: string;
}

export interface FlowNode {
  id: string;
  label: string;
}

export interface FlowLink {
  id: string;
  source: string;
  target: string;
  value: number;
}

export interface FlowModel {
  nodes: FlowNode[];
  links: FlowLink[];
}

export interface RadarConfig {
  axes: string[];
  series?: string;
}

export interface RadarAxis {
  id: string;
  label: string;
}

export interface RadarPoint {
  axisId: string;
  label: string;
  value: number;
}

export interface RadarSeries {
  key: string;
  label: string;
  points: RadarPoint[];
}

export interface RadarModel {
  axes: RadarAxis[];
  series: RadarSeries[];
}

export interface RoseConfig {
  category: string;
  measure: string;
}

export interface RoseSector {
  key: string;
  label: string;
  value: number;
  percent: number;
  startAngle: number;
  endAngle: number;
}

export interface RoseModel {
  total: number;
  sectors: RoseSector[];
}

export interface MekkoConfig {
  category: string;
  series: string;
  measure: string;
}

export interface MekkoSegment {
  key: string;
  label: string;
  value: number;
  percent: number;
}

export interface MekkoColumn {
  key: string;
  label: string;
  value: number;
  width: number;
  start: number;
  end: number;
  segments: MekkoSegment[];
}

export interface MekkoModel {
  total: number;
  columns: MekkoColumn[];
}

export interface PackedBubbleConfig {
  category: string;
  measure: string;
  sort?: PartWholeSort;
}

export interface PackedBubble {
  key: string;
  label: string;
  value: number;
  percent: number;
  radius: number;
}

export interface PackedBubbleModel {
  total: number;
  bubbles: PackedBubble[];
}

function cellKey(value: unknown): string {
  return value == null ? 'null' : String(value);
}

function pathKey(path: readonly string[]): string {
  return path.join('\u001f');
}

function assertDimension(model: DataModel, id: string, role: string): void {
  if (!findDimension(model, id)) {
    throw new Error(`Unknown ${role} dimension: ${id}`);
  }
}

function resolveMeasure(model: DataModel, id: string, role: string): Measure {
  const measure = findMeasure(model, id);
  if (!measure) {
    throw new Error(`Unknown ${role} measure: ${id}`);
  }
  return measure;
}

function groupRows(rows: readonly Row[], dimensionId: string): Map<string, Row[]> {
  const groups = new Map<string, Row[]>();
  for (const row of rows) {
    const key = cellKey(row[dimensionId]);
    const bucket = groups.get(key);
    if (bucket) {
      bucket.push(row);
    } else {
      groups.set(key, [row]);
    }
  }
  return groups;
}

function sortItems(items: PartWholeItem[], sort: PartWholeSort): PartWholeItem[] {
  if (sort === 'input') return items;

  return [...items].sort((a, b) => {
    const left = Number.isFinite(a.value) ? a.value : Number.NEGATIVE_INFINITY;
    const right = Number.isFinite(b.value) ? b.value : Number.NEGATIVE_INFINITY;
    return sort === 'value-desc' ? right - left : left - right;
  });
}

export function buildPartWholeModel(
  model: DataModel,
  data: readonly Row[],
  config: PartWholeConfig,
): PartWholeModel {
  assertDimension(model, config.category, 'part-whole category');
  const measure = resolveMeasure(model, config.measure, 'part-whole');

  const items = Array.from(groupRows(data, config.category), ([key, rows]) => ({
    key,
    label: key,
    value: aggregate(rows, measure),
    percent: 0,
    cumulativeValue: 0,
    cumulativePercent: 0,
  }));

  const total = items.reduce((sum, item) => sum + item.value, 0);
  const sorted = sortItems(items, config.sort ?? 'input');
  let cumulative = 0;

  for (const item of sorted) {
    cumulative += item.value;
    item.percent = total === 0 ? Number.NaN : item.value / total;
    item.cumulativeValue = cumulative;
    item.cumulativePercent = total === 0 ? Number.NaN : cumulative / total;
  }

  return { total, items: sorted };
}

function buildHierarchyNode(
  rows: readonly Row[],
  dimensions: readonly string[],
  measure: Measure,
  depth: number,
  path: readonly string[],
): PartWholeNode {
  const key = path.length === 0 ? 'root' : pathKey(path);
  const label = path.length === 0 ? 'Total' : path[path.length - 1]!;
  const node: PartWholeNode = {
    key,
    label,
    value: aggregate([...rows], measure),
  };

  if (depth < dimensions.length) {
    const children = Array.from(groupRows(rows, dimensions[depth]!), ([childKey, childRows]) =>
      buildHierarchyNode(childRows, dimensions, measure, depth + 1, [...path, childKey]),
    );
    node.children = children;
  }

  return node;
}

export function buildPartWholeHierarchy(
  model: DataModel,
  data: readonly Row[],
  config: PartWholeHierarchyConfig,
): PartWholeNode {
  if (config.hierarchy.length === 0) {
    throw new Error('Part-whole hierarchy requires at least one dimension');
  }
  for (const dimensionId of config.hierarchy) {
    assertDimension(model, dimensionId, 'part-whole hierarchy');
  }
  const measure = resolveMeasure(model, config.measure, 'part-whole hierarchy');
  return buildHierarchyNode(data, config.hierarchy, measure, 0, []);
}

export function buildWaterfallModel(
  model: DataModel,
  data: readonly Row[],
  config: WaterfallConfig,
): WaterfallModel {
  assertDimension(model, config.category, 'waterfall category');
  const measure = resolveMeasure(model, config.measure, 'waterfall');

  const steps: WaterfallStep[] = [];
  let cumulative = 0;

  for (const [key, rows] of groupRows(data, config.category)) {
    const delta = aggregate(rows, measure);
    const start = cumulative;
    cumulative += delta;
    steps.push({ key, label: key, kind: 'delta', delta, start, end: cumulative });
  }

  steps.push({
    key: 'total',
    label: config.totalLabel ?? 'Total',
    kind: 'total',
    delta: cumulative,
    start: 0,
    end: cumulative,
  });

  return { total: cumulative, steps };
}

export function buildFlowModel(
  model: DataModel,
  data: readonly Row[],
  config: FlowConfig,
): FlowModel {
  assertDimension(model, config.source, 'flow source');
  assertDimension(model, config.target, 'flow target');
  const measure = resolveMeasure(model, config.measure, 'flow');

  const nodes = new Map<string, FlowNode>();
  const linkRows = new Map<string, { source: string; target: string; rows: Row[] }>();

  const ensureNode = (id: string): void => {
    if (!nodes.has(id)) {
      nodes.set(id, { id, label: id });
    }
  };

  for (const row of data) {
    const source = cellKey(row[config.source]);
    const target = cellKey(row[config.target]);
    ensureNode(source);
    ensureNode(target);

    const id = pathKey([source, target]);
    const link = linkRows.get(id);
    if (link) {
      link.rows.push(row);
    } else {
      linkRows.set(id, { source, target, rows: [row] });
    }
  }

  return {
    nodes: [...nodes.values()],
    links: Array.from(linkRows, ([id, link]) => ({
      id,
      source: link.source,
      target: link.target,
      value: aggregate(link.rows, measure),
    })),
  };
}

export function buildRadarModel(
  model: DataModel,
  data: readonly Row[],
  config: RadarConfig,
): RadarModel {
  if (config.axes.length === 0) {
    throw new Error('Radar requires at least one measure axis');
  }
  if (config.series !== undefined) {
    assertDimension(model, config.series, 'radar series');
  }
  const measures = config.axes.map((axis) => resolveMeasure(model, axis, 'radar axis'));
  const groups =
    config.series === undefined
      ? new Map<string, Row[]>([['All', [...data]]])
      : groupRows(data, config.series);

  return {
    axes: measures.map((measure) => ({ id: measure.id, label: measure.label })),
    series: Array.from(groups, ([key, rows]) => ({
      key,
      label: key,
      points: measures.map((measure) => ({
        axisId: measure.id,
        label: measure.label,
        value: aggregate(rows, measure),
      })),
    })),
  };
}

export function buildRoseModel(
  model: DataModel,
  data: readonly Row[],
  config: RoseConfig,
): RoseModel {
  assertDimension(model, config.category, 'rose category');
  const measure = resolveMeasure(model, config.measure, 'rose');
  const rawSectors = Array.from(groupRows(data, config.category), ([key, rows]) => ({
    key,
    label: key,
    value: aggregate(rows, measure),
  }));
  const total = rawSectors.reduce((sum, sector) => sum + sector.value, 0);
  let angle = 0;
  const sectors = rawSectors.map((sector) => {
    const percent = total === 0 ? Number.NaN : sector.value / total;
    const startAngle = angle;
    angle += total === 0 ? 0 : percent * 360;
    return { ...sector, percent, startAngle, endAngle: angle };
  });

  return { total, sectors };
}

export function buildMekkoModel(
  model: DataModel,
  data: readonly Row[],
  config: MekkoConfig,
): MekkoModel {
  assertDimension(model, config.category, 'Mekko category');
  assertDimension(model, config.series, 'Mekko series');
  const measure = resolveMeasure(model, config.measure, 'Mekko');
  const categoryGroups = groupRows(data, config.category);
  const rawColumns = Array.from(categoryGroups, ([key, rows]) => {
    const value = aggregate(rows, measure);
    return {
      key,
      label: key,
      value,
      rows,
    };
  });
  const total = rawColumns.reduce((sum, column) => sum + column.value, 0);
  let offset = 0;

  const columns = rawColumns.map((column) => {
    const width = total === 0 ? 0 : column.value / total;
    const start = offset;
    offset += width;
    const segments = Array.from(groupRows(column.rows, config.series), ([key, rows]) => {
      const value = aggregate(rows, measure);
      return {
        key,
        label: key,
        value,
        percent: column.value === 0 ? Number.NaN : value / column.value,
      };
    });

    return {
      key: column.key,
      label: column.label,
      value: column.value,
      width,
      start,
      end: offset,
      segments,
    };
  });

  return { total, columns };
}

export function buildPackedBubbleModel(
  model: DataModel,
  data: readonly Row[],
  config: PackedBubbleConfig,
): PackedBubbleModel {
  assertDimension(model, config.category, 'packed bubble category');
  const measure = resolveMeasure(model, config.measure, 'packed bubble');
  const items = Array.from(groupRows(data, config.category), ([key, rows]) => ({
    key,
    label: key,
    value: aggregate(rows, measure),
    percent: 0,
    cumulativeValue: 0,
    cumulativePercent: 0,
  }));
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const sorted = sortItems(items, config.sort ?? 'input');

  return {
    total,
    bubbles: sorted.map((item) => ({
      key: item.key,
      label: item.label,
      value: item.value,
      percent: total === 0 ? Number.NaN : item.value / total,
      radius: Math.sqrt(Math.max(0, item.value) / Math.PI),
    })),
  };
}
