import { describe, it, expect } from 'vitest';
import {
  type DataModel,
  isDimensionType,
  isAggregation,
  isDimension,
  isMeasure,
  isDataModel,
  validateModel,
  assertModel,
  findDimension,
  findMeasure,
} from './index.js';

const model: DataModel = {
  dimensions: [
    { id: 'country', label: 'Country', type: 'discrete', hierarchy: ['country', 'region'] },
    { id: 'region', label: 'Region', type: 'discrete' },
    { id: 'age', label: 'Age', type: 'continuous' },
  ],
  measures: [
    { id: 'revenue', label: 'Revenue', aggregation: 'sum' },
    { id: 'orders', label: 'Orders', aggregation: 'count' },
  ],
};

describe('type guards', () => {
  it('isDimensionType accepts valid values', () => {
    expect(isDimensionType('discrete')).toBe(true);
    expect(isDimensionType('continuous')).toBe(true);
  });
  it('isDimensionType rejects invalid values', () => {
    expect(isDimensionType('ordinal')).toBe(false);
    expect(isDimensionType(42)).toBe(false);
    expect(isDimensionType(undefined)).toBe(false);
  });
  it('isAggregation accepts all five aggregations', () => {
    for (const a of ['sum', 'avg', 'min', 'max', 'count']) {
      expect(isAggregation(a)).toBe(true);
    }
  });
  it('isAggregation rejects unknown', () => {
    expect(isAggregation('median')).toBe(false);
    expect(isAggregation(null)).toBe(false);
  });
});

describe('isDimension', () => {
  it('accepts a valid dimension', () => {
    expect(isDimension({ id: 'x', label: 'X', type: 'discrete' })).toBe(true);
  });
  it('accepts a dimension with hierarchy', () => {
    expect(isDimension({ id: 'x', label: 'X', type: 'discrete', hierarchy: ['x'] })).toBe(true);
  });
  it('accepts a dimension with a folder', () => {
    expect(isDimension({ id: 'x', label: 'X', type: 'discrete', folder: 'Geo' })).toBe(true);
  });
  it('rejects missing fields', () => {
    expect(isDimension({ id: 'x', type: 'discrete' })).toBe(false);
    expect(isDimension({ id: '', label: 'X', type: 'discrete' })).toBe(false);
  });
  it('rejects bad type', () => {
    expect(isDimension({ id: 'x', label: 'X', type: 'nope' })).toBe(false);
  });
  it('rejects non-string hierarchy entries', () => {
    expect(isDimension({ id: 'x', label: 'X', type: 'discrete', hierarchy: [1] })).toBe(false);
  });
  it('rejects non-string folders', () => {
    expect(isDimension({ id: 'x', label: 'X', type: 'discrete', folder: 1 })).toBe(false);
  });
  it('rejects null/non-object', () => {
    expect(isDimension(null)).toBe(false);
    expect(isDimension('x')).toBe(false);
  });
});

describe('isMeasure', () => {
  it('accepts a valid measure', () => {
    expect(isMeasure({ id: 'm', label: 'M', aggregation: 'sum' })).toBe(true);
  });
  it('accepts a measure with a folder', () => {
    expect(isMeasure({ id: 'm', label: 'M', aggregation: 'sum', folder: 'Sales' })).toBe(true);
  });
  it('rejects bad aggregation', () => {
    expect(isMeasure({ id: 'm', label: 'M', aggregation: 'median' })).toBe(false);
  });
  it('rejects non-string measure folders', () => {
    expect(isMeasure({ id: 'm', label: 'M', aggregation: 'sum', folder: 1 })).toBe(false);
  });
  it('rejects missing label', () => {
    expect(isMeasure({ id: 'm', aggregation: 'sum' })).toBe(false);
  });
});

describe('isDataModel', () => {
  it('accepts a valid model', () => {
    expect(isDataModel(model)).toBe(true);
  });
  it('rejects non-arrays', () => {
    expect(isDataModel({ dimensions: {}, measures: [] })).toBe(false);
    expect(isDataModel(null)).toBe(false);
  });
});

describe('validateModel', () => {
  it('returns no errors for a valid model', () => {
    expect(validateModel(model)).toEqual([]);
  });
  it('detects duplicate ids across dimensions and measures', () => {
    const bad: DataModel = {
      dimensions: [{ id: 'dup', label: 'D', type: 'discrete' }],
      measures: [{ id: 'dup', label: 'M', aggregation: 'sum' }],
    };
    expect(validateModel(bad)).toContain('duplicate id: dup');
  });
  it('detects duplicate dimension ids', () => {
    const bad: DataModel = {
      dimensions: [
        { id: 'a', label: 'A', type: 'discrete' },
        { id: 'a', label: 'A2', type: 'discrete' },
      ],
      measures: [],
    };
    expect(validateModel(bad)).toContain('duplicate id: a');
  });
  it('detects hierarchy referencing unknown dimension', () => {
    const bad: DataModel = {
      dimensions: [{ id: 'a', label: 'A', type: 'discrete', hierarchy: ['ghost'] }],
      measures: [],
    };
    expect(validateModel(bad)).toContain(
      'dimension a hierarchy references unknown dimension: ghost',
    );
  });
  it('reports invalid dimension entries', () => {
    const bad = { dimensions: [{ id: 'x' }], measures: [] } as unknown as DataModel;
    expect(validateModel(bad).some((e) => e.startsWith('invalid dimension'))).toBe(true);
  });
  it('reports invalid measure entries', () => {
    const bad = {
      dimensions: [],
      measures: [{ id: 'm', label: 'M', aggregation: 'nope' }],
    } as unknown as DataModel;
    expect(validateModel(bad).some((e) => e.startsWith('invalid measure'))).toBe(true);
  });
  it('reports non-array top-level fields', () => {
    const bad = { dimensions: 'x', measures: [] } as unknown as DataModel;
    expect(validateModel(bad)).toContain('model.dimensions must be an array');
  });
});

describe('assertModel', () => {
  it('returns the model when valid', () => {
    expect(assertModel(model)).toBe(model);
  });
  it('throws when invalid', () => {
    const bad: DataModel = {
      dimensions: [{ id: 'dup', label: 'D', type: 'discrete' }],
      measures: [{ id: 'dup', label: 'M', aggregation: 'sum' }],
    };
    expect(() => assertModel(bad)).toThrow(/Invalid DataModel/);
  });
});

describe('lookups', () => {
  it('findDimension returns the matching dimension', () => {
    expect(findDimension(model, 'age')?.label).toBe('Age');
  });
  it('findDimension returns undefined for unknown', () => {
    expect(findDimension(model, 'ghost')).toBeUndefined();
  });
  it('findMeasure returns the matching measure', () => {
    expect(findMeasure(model, 'revenue')?.aggregation).toBe('sum');
  });
  it('findMeasure returns undefined for unknown', () => {
    expect(findMeasure(model, 'ghost')).toBeUndefined();
  });
});
