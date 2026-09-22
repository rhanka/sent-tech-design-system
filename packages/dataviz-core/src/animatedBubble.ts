/**
 * Helpers for the AnimatedBubbleChart (Gapminder-style).
 *
 * Builds one "frame" of scatter data from a filtered set of rows at a single
 * time step: maps x/y/size/series onto ScatterPlotDatum-compatible objects,
 * normalising the `size` measure to a per-datum radius `r` clamped to [4, 32].
 *
 * No framework dependency — pure data transforms.
 */

import type { DataModel, Row } from './model.js';
import { findMeasure, findDimension } from './model.js';

export type ScatterTone =
  | 'category1'
  | 'category2'
  | 'category3'
  | 'category4'
  | 'category5'
  | 'category6'
  | 'category7'
  | 'category8';

const TONES: ScatterTone[] = [
  'category1',
  'category2',
  'category3',
  'category4',
  'category5',
  'category6',
  'category7',
  'category8',
];

export interface BubbleDatum {
  x: number;
  y: number;
  r: number;
  label?: string;
  tone?: ScatterTone;
}

export interface BubbleFrame {
  data: BubbleDatum[];
  xLabel: string;
  yLabel: string;
}

function toFinite(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

/**
 * Return the sorted distinct string values for `field` across all rows.
 * Numeric strings are sorted numerically; non-numeric strings lexicographically.
 */
export function distinctSorted(rows: readonly Row[], field: string): string[] {
  const seen = new Set<string>();
  for (const row of rows) {
    if (row[field] != null) seen.add(String(row[field]));
  }
  const values = Array.from(seen);
  // Detect numeric values for correct ordering (e.g. years).
  const allNumeric = values.every((v) => Number.isFinite(Number(v)));
  if (allNumeric) {
    values.sort((a, b) => Number(a) - Number(b));
  } else {
    values.sort();
  }
  return values;
}

/**
 * Build one bubble-chart frame from `rows` (already filtered to a single time
 * step by the caller).
 *
 * @param model     DataModel for label lookup.
 * @param rows      Rows at the current time step.
 * @param config    Field ids for x, y, size, series, labelField.
 */
export function buildBubbleFrame(
  model: DataModel,
  rows: readonly Row[],
  config: {
    x: string;
    y: string;
    size: string;
    series?: string;
    labelField?: string;
  },
): BubbleFrame {
  const { x: xField, y: yField, size: sizeField, series, labelField } = config;

  // First pass: collect raw size values to compute normalisation range.
  const rawSizes: number[] = [];
  for (const row of rows) {
    const s = toFinite(row[sizeField]);
    if (s !== undefined && s >= 0) rawSizes.push(s);
  }
  const maxSize = rawSizes.length ? Math.max(...rawSizes) : 1;

  // Tone map: series value → tone (stable within a frame).
  const toneMap = new Map<string, ScatterTone>();
  let toneIdx = 0;

  const data: BubbleDatum[] = [];

  for (const row of rows) {
    const x = toFinite(row[xField]);
    const y = toFinite(row[yField]);
    if (x === undefined || y === undefined) continue;

    const rawSize = toFinite(row[sizeField]) ?? 0;
    // Map size to radius in [4, 32].
    const r = maxSize > 0 ? 4 + (rawSize / maxSize) * 28 : 4;

    const datum: BubbleDatum = { x, y, r: Math.round(r * 10) / 10 };

    if (series !== undefined) {
      const key = row[series] == null ? 'null' : String(row[series]);
      if (!toneMap.has(key)) {
        toneMap.set(key, TONES[toneIdx % TONES.length]!);
        toneIdx++;
      }
      datum.tone = toneMap.get(key);
      // Use series value as label if no explicit labelField.
      if (!labelField) datum.label = key;
    }

    if (labelField !== undefined) {
      const raw = row[labelField];
      if (raw != null) datum.label = String(raw);
    }

    data.push(datum);
  }

  const xLabel =
    findMeasure(model, xField)?.label ?? findDimension(model, xField)?.label ?? xField;
  const yLabel =
    findMeasure(model, yField)?.label ?? findDimension(model, yField)?.label ?? yField;

  return { data, xLabel, yLabel };
}
