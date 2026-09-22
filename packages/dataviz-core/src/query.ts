import { findDimension, findMeasure } from './model.js';
import type { DataModel, Row } from './model.js';
import type { FilterSpec } from './store.js';

export interface QueryFilterConfig {
  /** Dimension whose values will be included when rows match the query. */
  dimension: string;
  /** Text entered by the user. Empty/too-short text clears the owned filter. */
  query: string;
  /** Fields searched for the query. Defaults to the target dimension. */
  fields?: readonly string[];
  /** Minimum trimmed query length before filtering. Defaults to 1. */
  minLength?: number;
  /** Case-sensitive matching. Defaults to false. */
  caseSensitive?: boolean;
}

function cellKey(value: unknown): string {
  return value == null ? 'null' : String(value);
}

function assertKnownField(model: DataModel, field: string): void {
  if (!findDimension(model, field) && !findMeasure(model, field)) {
    throw new Error(`Unknown query field: ${field}`);
  }
}

function normalize(value: string, caseSensitive: boolean): string {
  return caseSensitive ? value : value.toLocaleLowerCase();
}

export function buildQueryFilterSpec(
  model: DataModel,
  data: readonly Row[],
  config: QueryFilterConfig,
): FilterSpec | null {
  if (!findDimension(model, config.dimension)) {
    throw new Error(`Unknown query dimension: ${config.dimension}`);
  }

  const fields = config.fields && config.fields.length > 0 ? [...config.fields] : [config.dimension];
  for (const field of fields) assertKnownField(model, field);

  const rawQuery = config.query.trim();
  const minLength = config.minLength ?? 1;
  if (rawQuery.length < minLength) return null;

  const caseSensitive = config.caseSensitive ?? false;
  const query = normalize(rawQuery, caseSensitive);
  const values: string[] = [];
  const seen = new Set<string>();

  for (const row of data) {
    const matches = fields.some((field) => normalize(cellKey(row[field]), caseSensitive).includes(query));
    if (!matches) continue;

    const key = cellKey(row[config.dimension]);
    if (!seen.has(key)) {
      seen.add(key);
      values.push(key);
    }
  }

  return { kind: 'include', values };
}
