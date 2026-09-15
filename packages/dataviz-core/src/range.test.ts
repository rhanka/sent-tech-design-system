import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildAreaRangeData, buildColumnRangeData } from './range.js';

const model: DataModel = {
  dimensions: [
    { id: 'period', label: 'Période', type: 'discrete' },
    { id: 'region', label: 'Région', type: 'discrete' },
  ],
  measures: [
    { id: 'low', label: 'Minimum', aggregation: 'min' },
    { id: 'high', label: 'Maximum', aggregation: 'max' },
  ],
};

// ---------------------------------------------------------------------------
// buildAreaRangeData
// ---------------------------------------------------------------------------

const areaRows: Row[] = [
  { period: '2024-Q1', low: 10, high: 30 },
  { period: '2024-Q2', low: 15, high: 40 },
  { period: '2024-Q3', low: 5, high: 25 },
];

const areaConfig = { x: 'period', low: 'low', high: 'high' };

describe('buildAreaRangeData', () => {
  it('maps x, low, high fields per row', () => {
    const result = buildAreaRangeData(model, areaRows, areaConfig);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ x: '2024-Q1', low: 10, high: 30 });
    expect(result[1]).toEqual({ x: '2024-Q2', low: 15, high: 40 });
    expect(result[2]).toEqual({ x: '2024-Q3', low: 5, high: 25 });
  });

  it('drops rows where low or high is non-finite', () => {
    const sparseRows: Row[] = [
      { period: '2024-Q1', low: 10, high: 30 },
      { period: '2024-Q2', low: null, high: 40 },
      { period: '2024-Q3', low: 5, high: NaN },
      { period: '2024-Q4', low: undefined, high: undefined },
    ];
    const result = buildAreaRangeData(model, sparseRows, areaConfig);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ x: '2024-Q1', low: 10, high: 30 });
  });

  it('coerces the x field to a string', () => {
    const numericXRows: Row[] = [
      { period: 20240101, low: 10, high: 30 },
    ];
    const result = buildAreaRangeData(model, numericXRows, areaConfig);
    expect(result[0]!.x).toBe('20240101');
  });
});

// ---------------------------------------------------------------------------
// buildColumnRangeData
// ---------------------------------------------------------------------------

const columnRows: Row[] = [
  { region: 'Nord', low: 5, high: 20 },
  { region: 'Sud', low: 8, high: 35 },
  { region: 'Est', low: 2, high: 18 },
];

const columnConfig = { category: 'region', low: 'low', high: 'high' };

describe('buildColumnRangeData', () => {
  it('maps category, low, high fields per row', () => {
    const result = buildColumnRangeData(model, columnRows, columnConfig);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ category: 'Nord', low: 5, high: 20 });
    expect(result[1]).toEqual({ category: 'Sud', low: 8, high: 35 });
    expect(result[2]).toEqual({ category: 'Est', low: 2, high: 18 });
  });

  it('drops rows where low or high is non-finite', () => {
    const sparseRows: Row[] = [
      { region: 'Nord', low: 5, high: 20 },
      { region: 'Sud', low: null, high: 35 },
      { region: 'Est', low: 2, high: undefined },
    ];
    const result = buildColumnRangeData(model, sparseRows, columnConfig);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ category: 'Nord', low: 5, high: 20 });
  });

  it('coerces the category field to a string', () => {
    const numericCatRows: Row[] = [
      { region: 42, low: 5, high: 20 },
    ];
    const result = buildColumnRangeData(model, numericCatRows, columnConfig);
    expect(result[0]!.category).toBe('42');
  });
});
