/**
 * Word cloud chart data builder.
 *
 * Maps word text and weight fields from raw rows into WordCloudDatum-compatible
 * objects, as expected by the DS WordCloudChart component.
 *
 * No aggregation: each row becomes one datum. A row is dropped silently when
 * `weight` is non-finite (mirrors the null-handling pattern in scatter.ts and
 * candlestick.ts). Tones cycle category1..category8 in row-insertion order.
 */

import { type DataModel, type Row } from './model.js';

const WORD_CLOUD_TONES = [
  'category1',
  'category2',
  'category3',
  'category4',
  'category5',
  'category6',
  'category7',
  'category8',
] as const;

export type WordCloudTone = (typeof WORD_CLOUD_TONES)[number];

export interface WordCloudDatum {
  text: string;
  weight: number;
  tone?: WordCloudTone;
}

export interface WordCloudConfig {
  /** Field id whose value becomes the word text (string-coerced). */
  word: string;
  /** Field id whose numeric value becomes the word weight/frequency. */
  weight: string;
}

function toFiniteNumber(value: unknown): number | undefined {
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

/**
 * Build word cloud data from raw rows by mapping word and weight fields and
 * assigning cycling categorical tones.
 *
 * @param _model  DataModel — reserved for future label/format lookup
 * @param rows    Filtered rows from `store.applyCrossfilter(viewId)`
 * @param config  { word, weight } — field ids
 */
export function buildWordCloudData(
  _model: DataModel,
  rows: readonly Row[],
  config: WordCloudConfig,
): WordCloudDatum[] {
  const data: WordCloudDatum[] = [];

  for (const row of rows) {
    const weight = toFiniteNumber(row[config.weight]);

    if (weight === undefined) {
      continue;
    }

    const textRaw = row[config.word];
    const text = textRaw == null ? '' : String(textRaw);
    const tone = WORD_CLOUD_TONES[data.length % WORD_CLOUD_TONES.length];

    data.push({ text, weight, tone });
  }

  return data;
}
