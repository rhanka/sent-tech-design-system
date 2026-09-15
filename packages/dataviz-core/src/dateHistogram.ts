import { findDimension } from './model.js';
import type { Cell, DataModel, Row } from './model.js';

export type DateHistogramInterval = 'hour' | 'day' | 'week' | 'month';

export interface DateHistogramConfig {
  /** Date/time dimension. Cells are expected to be epoch-millisecond values. */
  date: string;
  /** Calendar-aligned bucket interval. When omitted, fixed-count bins are used. */
  interval?: DateHistogramInterval;
  /** Number of fixed-count bins. Defaults to 10. Ignored when `interval` is set. */
  bins?: number;
  /** Optional domain in epoch milliseconds. */
  domain?: readonly [number, number];
}

export interface DateHistogramBin {
  index: number;
  start: number;
  end: number;
  count: number;
}

export interface DateHistogramModel {
  dateId: string;
  domain: [number, number];
  bins: DateHistogramBin[];
}

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

function toTime(value: Cell | undefined): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string' || value.trim() === '') return null;
  const numeric = Number(value);
  if (Number.isFinite(numeric)) return numeric;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function assertDomain(min: number, max: number): void {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min > max) {
    throw new Error('Date histogram domain must be finite and ordered');
  }
}

function floorMonth(value: number): number {
  const date = new Date(value);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1);
}

function addMonth(value: number): number {
  const date = new Date(value);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1);
}

function floorInterval(value: number, interval: DateHistogramInterval): number {
  if (interval === 'month') return floorMonth(value);
  if (interval === 'week') {
    const utcMidnight = Math.floor(value / DAY) * DAY;
    const day = new Date(utcMidnight).getUTCDay();
    const mondayOffset = (day + 6) % 7;
    return utcMidnight - mondayOffset * DAY;
  }
  const step = interval === 'hour' ? HOUR : DAY;
  return Math.floor(value / step) * step;
}

function nextInterval(value: number, interval: DateHistogramInterval): number {
  if (interval === 'month') return addMonth(value);
  return value + (interval === 'hour' ? HOUR : interval === 'day' ? DAY : WEEK);
}

function ceilInterval(value: number, interval: DateHistogramInterval): number {
  return nextInterval(floorInterval(value, interval), interval);
}

function buildCalendarBins(
  values: readonly number[],
  minRaw: number,
  maxRaw: number,
  interval: DateHistogramInterval,
): DateHistogramBin[] {
  const start = floorInterval(minRaw, interval);
  const end = ceilInterval(maxRaw, interval);
  const bins: DateHistogramBin[] = [];
  for (let cursor = start, index = 0; cursor < end; cursor = nextInterval(cursor, interval), index += 1) {
    const next = nextInterval(cursor, interval);
    const count = values.filter((value) => value >= minRaw && value <= maxRaw && value >= cursor && value < next).length;
    bins.push({ index, start: cursor, end: next, count });
  }
  return bins;
}

function buildFixedBins(values: readonly number[], min: number, max: number, binCount: number): DateHistogramBin[] {
  if (min === max) return [{ index: 0, start: min, end: max, count: values.length }];

  const width = (max - min) / binCount;
  const counts = Array.from({ length: binCount }, () => 0);
  for (const value of values) {
    if (value < min || value > max) continue;
    const index = Math.min(Math.floor((value - min) / width), binCount - 1);
    counts[index] += 1;
  }
  return counts.map((count, index) => ({
    index,
    start: min + index * width,
    end: index === binCount - 1 ? max : min + (index + 1) * width,
    count,
  }));
}

export function buildDateHistogramModel(
  model: DataModel,
  data: readonly Row[],
  config: DateHistogramConfig,
): DateHistogramModel {
  if (!findDimension(model, config.date)) {
    throw new Error(`Unknown date histogram dimension: ${config.date}`);
  }

  const binCount = config.bins ?? 10;
  if (!Number.isInteger(binCount) || binCount <= 0) {
    throw new Error('Date histogram bins must be a positive integer');
  }

  const values = data.map((row) => toTime(row[config.date])).filter((value): value is number => value !== null);
  if (values.length === 0) {
    return { dateId: config.date, domain: [Number.NaN, Number.NaN], bins: [] };
  }

  const minRaw = config.domain?.[0] ?? Math.min(...values);
  const maxRaw = config.domain?.[1] ?? Math.max(...values);
  assertDomain(minRaw, maxRaw);

  if (config.interval) {
    const bins = buildCalendarBins(values, minRaw, maxRaw, config.interval);
    return {
      dateId: config.date,
      domain: [bins[0]?.start ?? minRaw, bins[bins.length - 1]?.end ?? maxRaw],
      bins,
    };
  }

  return {
    dateId: config.date,
    domain: [minRaw, maxRaw],
    bins: buildFixedBins(values, minRaw, maxRaw, binCount),
  };
}
