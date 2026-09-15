/**
 * Data model primitives for dataviz.
 *
 * A {@link DataModel} describes the *shape* of a dataset in BI terms:
 * which columns are dimensions (things you slice/group by) and which are
 * measures (things you aggregate). It carries no data itself.
 */

/** A single record. Values are JSON-serialisable scalars. */
export type Cell = string | number | boolean | null;

/** A row of data keyed by dimension/measure id. */
export type Row = Record<string, Cell>;

/** How a dimension's values are distributed. */
export type DimensionType = 'discrete' | 'continuous';

/** Aggregation applied to a measure when rolling up rows. */
export type Aggregation = 'sum' | 'avg' | 'min' | 'max' | 'count';

/** A column you slice, group or drill by. */
export interface Dimension {
  id: string;
  label: string;
  type: DimensionType;
  /** Optional field-pane folder/group label. */
  folder?: string;
  /**
   * Optional drill-down path, ordered from coarse to fine, e.g.
   * `['country', 'region', 'city']`. Each entry is a dimension id.
   */
  hierarchy?: string[];
}

/** A column you aggregate. */
export interface Measure {
  id: string;
  label: string;
  aggregation: Aggregation;
  /** Optional field-pane folder/group label. */
  folder?: string;
}

/** The full declarative model of a dataset. */
export interface DataModel {
  dimensions: Dimension[];
  measures: Measure[];
}

const DIMENSION_TYPES: readonly DimensionType[] = ['discrete', 'continuous'];
const AGGREGATIONS: readonly Aggregation[] = ['sum', 'avg', 'min', 'max', 'count'];

export function isDimensionType(value: unknown): value is DimensionType {
  return typeof value === 'string' && (DIMENSION_TYPES as readonly string[]).includes(value);
}

export function isAggregation(value: unknown): value is Aggregation {
  return typeof value === 'string' && (AGGREGATIONS as readonly string[]).includes(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

export function isDimension(value: unknown): value is Dimension {
  if (typeof value !== 'object' || value === null) return false;
  const d = value as Record<string, unknown>;
  if (!isNonEmptyString(d.id) || !isNonEmptyString(d.label)) return false;
  if (!isDimensionType(d.type)) return false;
  if (d.folder !== undefined && !isNonEmptyString(d.folder)) return false;
  if (d.hierarchy !== undefined) {
    if (!Array.isArray(d.hierarchy)) return false;
    if (!d.hierarchy.every((h) => isNonEmptyString(h))) return false;
  }
  return true;
}

export function isMeasure(value: unknown): value is Measure {
  if (typeof value !== 'object' || value === null) return false;
  const m = value as Record<string, unknown>;
  if (!isNonEmptyString(m.id) || !isNonEmptyString(m.label)) return false;
  if (m.folder !== undefined && !isNonEmptyString(m.folder)) return false;
  return isAggregation(m.aggregation);
}

export function isDataModel(value: unknown): value is DataModel {
  if (typeof value !== 'object' || value === null) return false;
  const m = value as Record<string, unknown>;
  if (!Array.isArray(m.dimensions) || !Array.isArray(m.measures)) return false;
  return m.dimensions.every(isDimension) && m.measures.every(isMeasure);
}

/**
 * Validate a {@link DataModel} and return the list of problems found.
 * An empty array means the model is valid.
 *
 * Checks structural validity, duplicate ids (a dimension and a measure may
 * not share an id), and that every hierarchy entry references a known
 * dimension id.
 */
export function validateModel(model: DataModel): string[] {
  const errors: string[] = [];

  if (!Array.isArray(model.dimensions)) {
    errors.push('model.dimensions must be an array');
  }
  if (!Array.isArray(model.measures)) {
    errors.push('model.measures must be an array');
  }
  if (errors.length > 0) return errors;

  const seen = new Set<string>();
  const dimensionIds = new Set<string>();

  for (const dim of model.dimensions) {
    if (!isDimension(dim)) {
      errors.push(`invalid dimension: ${JSON.stringify(dim)}`);
      continue;
    }
    if (seen.has(dim.id)) {
      errors.push(`duplicate id: ${dim.id}`);
    }
    seen.add(dim.id);
    dimensionIds.add(dim.id);
  }

  for (const measure of model.measures) {
    if (!isMeasure(measure)) {
      errors.push(`invalid measure: ${JSON.stringify(measure)}`);
      continue;
    }
    if (seen.has(measure.id)) {
      errors.push(`duplicate id: ${measure.id}`);
    }
    seen.add(measure.id);
  }

  for (const dim of model.dimensions) {
    if (!isDimension(dim) || !dim.hierarchy) continue;
    for (const ref of dim.hierarchy) {
      if (!dimensionIds.has(ref)) {
        errors.push(`dimension ${dim.id} hierarchy references unknown dimension: ${ref}`);
      }
    }
  }

  return errors;
}

/** Throwing variant of {@link validateModel}. Returns the model on success. */
export function assertModel(model: DataModel): DataModel {
  const errors = validateModel(model);
  if (errors.length > 0) {
    throw new Error(`Invalid DataModel:\n- ${errors.join('\n- ')}`);
  }
  return model;
}

/** Look up a dimension by id, or `undefined`. */
export function findDimension(model: DataModel, id: string): Dimension | undefined {
  return model.dimensions.find((d) => d.id === id);
}

/** Look up a measure by id, or `undefined`. */
export function findMeasure(model: DataModel, id: string): Measure | undefined {
  return model.measures.find((m) => m.id === id);
}
