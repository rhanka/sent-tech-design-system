/**
 * Analytic overlay data contracts.
 *
 * These builders compute values for overlays such as reference/goal lines,
 * percentile bands, trend lines and error bars. Rendering belongs to the DS.
 */

import { aggregate, extractNumbers } from './aggregate.js';
import { findDimension, findMeasure } from './model.js';
import type { DataModel, Measure, Row } from './model.js';

export interface ReferenceLineConfig {
  id?: string;
  label?: string;
  value?: number;
  measure?: string;
}

export interface ReferenceLineModel {
  id: string;
  label: string;
  value: number;
  source: 'static' | 'measure';
  measureId?: string;
}

export interface PercentileBandConfig {
  value: string;
  lower: number;
  upper: number;
}

export interface PercentileBandModel {
  valueId: string;
  lowerPercentile: number;
  upperPercentile: number;
  lowerValue: number;
  upperValue: number;
  median: number;
}

export interface TrendLineConfig {
  x: string;
  y: string;
}

export interface TrendPoint {
  x: number;
  y: number;
}

export interface TrendLineModel {
  xId: string;
  yId: string;
  slope: number;
  intercept: number;
  rSquared: number;
  points: TrendPoint[];
}

export interface ForecastConfig {
  x: string;
  y: string;
  periods: number;
  step?: number;
}

export interface ForecastModel {
  xId: string;
  yId: string;
  method: 'linear';
  slope: number;
  intercept: number;
  points: TrendPoint[];
}

export interface ErrorBarsConfig {
  category: string;
  value: string;
  interval?: 'stdev' | 'stderr';
}

export interface ErrorBarItem {
  key: string;
  label: string;
  count: number;
  mean: number;
  stdev: number;
  lower: number;
  upper: number;
}

export interface ErrorBarsModel {
  categoryId: string;
  valueId: string;
  interval: 'stdev' | 'stderr';
  items: ErrorBarItem[];
}

export interface AnalyticsClusterConfig {
  fields: string[];
  k: number;
  maxIterations?: number;
}

export interface AnalyticsCluster {
  id: string;
  centroid: Record<string, number>;
  count: number;
  rowIndices: number[];
}

export interface AnalyticsClusterModel {
  fields: string[];
  clusters: AnalyticsCluster[];
}

function cellKey(value: unknown): string {
  return value == null ? 'null' : String(value);
}

function toFiniteNumber(value: unknown): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function assertValueField(model: DataModel, id: string, role: string): void {
  if (!findMeasure(model, id) && !findDimension(model, id)) {
    throw new Error(`Unknown ${role} field: ${id}`);
  }
}

function resolveMeasure(model: DataModel, id: string, role: string): Measure {
  const measure = findMeasure(model, id);
  if (!measure) {
    throw new Error(`Unknown ${role} measure: ${id}`);
  }
  return measure;
}

function assertDimension(model: DataModel, id: string, role: string): void {
  if (!findDimension(model, id)) {
    throw new Error(`Unknown ${role} dimension: ${id}`);
  }
}

function assertPercentile(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new Error(`${label} percentile must be between 0 and 1`);
  }
}

function quantile(sorted: readonly number[], p: number): number {
  if (sorted.length === 0) return Number.NaN;
  const position = (sorted.length - 1) * p;
  const base = Math.floor(position);
  const rest = position - base;
  const current = sorted[base]!;
  const next = sorted[base + 1] ?? current;
  return current + rest * (next - current);
}

function groupRows(rows: readonly Row[], field: string): Map<string, Row[]> {
  const groups = new Map<string, Row[]>();
  for (const row of rows) {
    const key = cellKey(row[field]);
    const bucket = groups.get(key);
    if (bucket) {
      bucket.push(row);
    } else {
      groups.set(key, [row]);
    }
  }
  return groups;
}

function mean(values: readonly number[]): number {
  return values.length === 0
    ? Number.NaN
    : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function sampleStdev(values: readonly number[], avg: number): number {
  if (values.length <= 1) return 0;
  const variance =
    values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function assertPositiveInteger(value: number, message: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(message);
  }
}

function numericPairs(data: readonly Row[], xField: string, yField: string): TrendPoint[] {
  return data
    .map((row) => {
      const x = toFiniteNumber(row[xField]);
      const y = toFiniteNumber(row[yField]);
      return x === undefined || y === undefined ? undefined : { x, y };
    })
    .filter((point): point is TrendPoint => point !== undefined);
}

export function buildReferenceLineModel(
  model: DataModel,
  data: readonly Row[],
  config: ReferenceLineConfig,
): ReferenceLineModel {
  if (config.value !== undefined) {
    if (!Number.isFinite(config.value)) {
      throw new Error('Reference line value must be finite');
    }
    const label = config.label ?? 'Reference';
    return {
      id: config.id ?? `reference:${label}`,
      label,
      value: config.value,
      source: 'static',
    };
  }

  if (config.measure === undefined) {
    throw new Error('Reference line requires either value or measure');
  }

  const measure = resolveMeasure(model, config.measure, 'reference line');
  return {
    id: config.id ?? `reference:${measure.id}`,
    label: config.label ?? measure.label,
    value: aggregate([...data], measure),
    source: 'measure',
    measureId: measure.id,
  };
}

export function buildPercentileBandModel(
  model: DataModel,
  data: readonly Row[],
  config: PercentileBandConfig,
): PercentileBandModel {
  assertValueField(model, config.value, 'percentile band value');
  assertPercentile(config.lower, 'Lower');
  assertPercentile(config.upper, 'Upper');
  if (config.lower > config.upper) {
    throw new Error('Percentile band requires lower <= upper');
  }

  const values = extractNumbers([...data], config.value).sort((a, b) => a - b);
  return {
    valueId: config.value,
    lowerPercentile: config.lower,
    upperPercentile: config.upper,
    lowerValue: quantile(values, config.lower),
    upperValue: quantile(values, config.upper),
    median: quantile(values, 0.5),
  };
}

export function buildTrendLineModel(
  model: DataModel,
  data: readonly Row[],
  config: TrendLineConfig,
): TrendLineModel {
  assertValueField(model, config.x, 'trend x');
  assertValueField(model, config.y, 'trend y');

  const points = numericPairs(data, config.x, config.y);

  if (points.length < 2) {
    return {
      xId: config.x,
      yId: config.y,
      slope: Number.NaN,
      intercept: Number.NaN,
      rSquared: Number.NaN,
      points: [],
    };
  }

  const xMean = mean(points.map((point) => point.x));
  const yMean = mean(points.map((point) => point.y));
  const sxx = points.reduce((sum, point) => sum + (point.x - xMean) ** 2, 0);
  const sxy = points.reduce((sum, point) => sum + (point.x - xMean) * (point.y - yMean), 0);
  const slope = sxx === 0 ? Number.NaN : sxy / sxx;
  const intercept = yMean - slope * xMean;
  const sst = points.reduce((sum, point) => sum + (point.y - yMean) ** 2, 0);
  const sse = points.reduce((sum, point) => {
    const predicted = intercept + slope * point.x;
    return sum + (point.y - predicted) ** 2;
  }, 0);
  const rSquared = sst === 0 ? 1 : 1 - sse / sst;
  const minX = Math.min(...points.map((point) => point.x));
  const maxX = Math.max(...points.map((point) => point.x));

  return {
    xId: config.x,
    yId: config.y,
    slope,
    intercept,
    rSquared,
    points: [
      { x: minX, y: intercept + slope * minX },
      { x: maxX, y: intercept + slope * maxX },
    ],
  };
}

export function buildForecastModel(
  model: DataModel,
  data: readonly Row[],
  config: ForecastConfig,
): ForecastModel {
  assertPositiveInteger(config.periods, 'Forecast periods must be a positive integer');
  if (config.step !== undefined && (!Number.isFinite(config.step) || config.step <= 0)) {
    throw new Error('Forecast step must be a positive finite number');
  }

  const trend = buildTrendLineModel(model, data, { x: config.x, y: config.y });
  const points = numericPairs(data, config.x, config.y);
  if (!Number.isFinite(trend.slope) || points.length === 0) {
    return {
      xId: config.x,
      yId: config.y,
      method: 'linear',
      slope: trend.slope,
      intercept: trend.intercept,
      points: [],
    };
  }

  const sortedX = points.map((point) => point.x).sort((a, b) => a - b);
  const maxX = sortedX[sortedX.length - 1]!;
  const inferredStep =
    sortedX.length <= 1 ? 1 : (sortedX[sortedX.length - 1]! - sortedX[0]!) / (sortedX.length - 1);
  const step = config.step ?? (inferredStep > 0 ? inferredStep : 1);

  return {
    xId: config.x,
    yId: config.y,
    method: 'linear',
    slope: trend.slope,
    intercept: trend.intercept,
    points: Array.from({ length: config.periods }, (_, index) => {
      const x = maxX + step * (index + 1);
      return { x, y: trend.intercept + trend.slope * x };
    }),
  };
}

export function buildErrorBarsModel(
  model: DataModel,
  data: readonly Row[],
  config: ErrorBarsConfig,
): ErrorBarsModel {
  assertDimension(model, config.category, 'error bars category');
  assertValueField(model, config.value, 'error bars value');
  const interval = config.interval ?? 'stdev';
  if (interval !== 'stdev' && interval !== 'stderr') {
    throw new Error('Error bars interval must be stdev or stderr');
  }

  return {
    categoryId: config.category,
    valueId: config.value,
    interval,
    items: Array.from(groupRows(data, config.category), ([key, rows]) => {
      const values = extractNumbers(rows, config.value);
      const avg = mean(values);
      const stdev = sampleStdev(values, avg);
      const offset = interval === 'stderr' ? stdev / Math.sqrt(values.length) : stdev;
      return {
        key,
        label: key,
        count: values.length,
        mean: avg,
        stdev,
        lower: avg - offset,
        upper: avg + offset,
      };
    }),
  };
}

interface ClusterPoint {
  rowIndex: number;
  values: Record<string, number>;
  vector: number[];
}

function clusterPoints(data: readonly Row[], fields: readonly string[]): ClusterPoint[] {
  const points: ClusterPoint[] = [];
  data.forEach((row, rowIndex) => {
    const vector: number[] = [];
    const values: Record<string, number> = {};
    for (const field of fields) {
      const value = toFiniteNumber(row[field]);
      if (value === undefined) return;
      vector.push(value);
      values[field] = value;
    }
    points.push({ rowIndex, values, vector });
  });
  return points;
}

function squaredDistance(a: readonly number[], b: readonly number[]): number {
  return a.reduce((sum, value, index) => sum + (value - b[index]!) ** 2, 0);
}

function nearestCentroid(point: ClusterPoint, centroids: readonly number[][]): number {
  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  centroids.forEach((centroid, index) => {
    const distance = squaredDistance(point.vector, centroid);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });
  return bestIndex;
}

function centroidObject(fields: readonly string[], vector: readonly number[]): Record<string, number> {
  const out: Record<string, number> = {};
  fields.forEach((field, index) => {
    out[field] = vector[index]!;
  });
  return out;
}

export function buildAnalyticsClusterModel(
  model: DataModel,
  data: readonly Row[],
  config: AnalyticsClusterConfig,
): AnalyticsClusterModel {
  if (config.fields.length === 0) {
    throw new Error('Analytics cluster requires at least one field');
  }
  for (const field of config.fields) {
    assertValueField(model, field, 'analytics cluster');
  }
  assertPositiveInteger(config.k, 'Analytics cluster k must be a positive integer');
  const maxIterations = config.maxIterations ?? 20;
  assertPositiveInteger(maxIterations, 'Analytics cluster maxIterations must be a positive integer');

  const points = clusterPoints(data, config.fields);
  if (points.length < config.k) {
    throw new Error('Analytics cluster k cannot exceed available complete rows');
  }

  let centroids = points.slice(0, config.k).map((point) => [...point.vector]);
  let assignments = points.map(() => -1);

  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    const nextAssignments = points.map((point) => nearestCentroid(point, centroids));
    const changed = nextAssignments.some((assignment, index) => assignment !== assignments[index]);
    assignments = nextAssignments;

    const sums = Array.from({ length: config.k }, () => Array.from({ length: config.fields.length }, () => 0));
    const counts = Array.from({ length: config.k }, () => 0);
    points.forEach((point, index) => {
      const clusterIndex = assignments[index]!;
      counts[clusterIndex] += 1;
      point.vector.forEach((value, fieldIndex) => {
        sums[clusterIndex]![fieldIndex]! += value;
      });
    });
    centroids = centroids.map((centroid, clusterIndex) =>
      counts[clusterIndex] === 0
        ? centroid
        : sums[clusterIndex]!.map((sum) => sum / counts[clusterIndex]!),
    );

    if (!changed) break;
  }

  return {
    fields: [...config.fields],
    clusters: centroids.map((centroid, clusterIndex) => {
      const rowIndices = points
        .filter((_, index) => assignments[index] === clusterIndex)
        .map((point) => point.rowIndex);
      return {
        id: `cluster:${clusterIndex}`,
        centroid: centroidObject(config.fields, centroid),
        count: rowIndices.length,
        rowIndices,
      };
    }),
  };
}
