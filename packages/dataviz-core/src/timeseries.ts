import { aggregate } from './aggregate.js';
import { findDimension, findMeasure, type Cell, type DataModel, type Row } from './model.js';

export type TimeSeriesConfig = {
  time: string;
  measure: string;
  series?: string;
};

export type TimeSeriesSeries = {
  id: string;
  label: string;
  measureId: string;
  seriesKey?: string;
  seriesLabel?: string;
  values: Array<number | null>;
};

export type TimeSeriesModel = {
  timeId: string;
  measureId: string;
  seriesId?: string;
  times: number[];
  series: TimeSeriesSeries[];
};

function cellKey(value: Cell | undefined): string {
  return value == null ? 'null' : String(value);
}

function timeValue(value: Cell | undefined): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const numeric = Number(trimmed);
  if (Number.isFinite(numeric)) return numeric;
  const parsed = Date.parse(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function uniqueSortedTimes(rows: readonly Row[], time: string): number[] {
  const seen = new Set<number>();
  for (const row of rows) {
    const value = timeValue(row[time]);
    if (value !== null) seen.add(value);
  }
  return [...seen].sort((a, b) => a - b);
}

function uniqueSeriesKeys(rows: readonly Row[], series: string): string[] {
  const seen = new Set<string>();
  const keys: string[] = [];
  for (const row of rows) {
    const key = cellKey(row[series]);
    if (!seen.has(key)) {
      seen.add(key);
      keys.push(key);
    }
  }
  return keys;
}

function aggregateBucket(rows: readonly Row[], measure: NonNullable<ReturnType<typeof findMeasure>>): number | null {
  if (rows.length === 0) return null;
  const value = aggregate([...rows], measure);
  return Number.isFinite(value) ? value : null;
}

export function buildTimeSeriesModel(
  model: DataModel,
  data: readonly Row[],
  config: TimeSeriesConfig,
): TimeSeriesModel {
  if (!findDimension(model, config.time)) {
    throw new Error(`Unknown time series time dimension: ${config.time}`);
  }
  if (config.series !== undefined && !findDimension(model, config.series)) {
    throw new Error(`Unknown time series series dimension: ${config.series}`);
  }
  const measure = findMeasure(model, config.measure);
  if (!measure) {
    throw new Error(`Unknown time series measure: ${config.measure}`);
  }

  const validRows = data.filter((row) => timeValue(row[config.time]) !== null);
  const times = uniqueSortedTimes(validRows, config.time);

  if (config.series === undefined) {
    return {
      timeId: config.time,
      measureId: config.measure,
      times,
      series: [
        {
          id: `measure:${measure.id}`,
          label: measure.label,
          measureId: measure.id,
          values: times.map((time) => aggregateBucket(validRows.filter((row) => timeValue(row[config.time]) === time), measure)),
        },
      ],
    };
  }

  const seriesId = config.series;
  const keys = uniqueSeriesKeys(validRows, seriesId);
  return {
    timeId: config.time,
    measureId: config.measure,
    seriesId,
    times,
    series: keys.map((key) => ({
      id: `series:${key}:${measure.id}`,
      label: key,
      measureId: measure.id,
      seriesKey: key,
      seriesLabel: key,
      values: times.map((time) =>
        aggregateBucket(
          validRows.filter((row) => timeValue(row[config.time]) === time && cellKey(row[seriesId]) === key),
          measure,
        ),
      ),
    })),
  };
}
