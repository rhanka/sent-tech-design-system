import { describe, it, expect } from 'vitest';
import {
  type DataModel,
  type Row,
  buildAnalyticsClusterModel,
  buildErrorBarsModel,
  buildForecastModel,
  buildPercentileBandModel,
  buildReferenceLineModel,
  buildTrendLineModel,
} from './index.js';

const model: DataModel = {
  dimensions: [
    { id: 'category', label: 'Category', type: 'discrete' },
    { id: 'x', label: 'X', type: 'continuous' },
  ],
  measures: [{ id: 'revenue', label: 'Revenue', aggregation: 'sum' }],
};

describe('analytic overlay builders', () => {
  it('builds static and measure-backed reference lines', () => {
    const rows: Row[] = [{ revenue: 100 }, { revenue: 50 }];

    expect(buildReferenceLineModel(model, rows, { value: 200, label: 'Goal' })).toEqual({
      id: 'reference:Goal',
      label: 'Goal',
      value: 200,
      source: 'static',
    });
    expect(buildReferenceLineModel(model, rows, { measure: 'revenue' })).toEqual({
      id: 'reference:revenue',
      label: 'Revenue',
      value: 150,
      source: 'measure',
      measureId: 'revenue',
    });
  });

  it('builds percentile bands over numeric values', () => {
    const rows: Row[] = [
      { revenue: 10 },
      { revenue: 20 },
      { revenue: 30 },
      { revenue: 40 },
      { revenue: 50 },
    ];

    expect(
      buildPercentileBandModel(model, rows, {
        value: 'revenue',
        lower: 0.25,
        upper: 0.75,
      }),
    ).toEqual({
      valueId: 'revenue',
      lowerPercentile: 0.25,
      upperPercentile: 0.75,
      lowerValue: 20,
      upperValue: 40,
      median: 30,
    });
  });

  it('builds a linear trend line with r-squared', () => {
    const rows: Row[] = [
      { x: 1, revenue: 2 },
      { x: 2, revenue: 4 },
      { x: 3, revenue: 6 },
    ];

    expect(buildTrendLineModel(model, rows, { x: 'x', y: 'revenue' })).toEqual({
      xId: 'x',
      yId: 'revenue',
      slope: 2,
      intercept: 0,
      rSquared: 1,
      points: [
        { x: 1, y: 2 },
        { x: 3, y: 6 },
      ],
    });
  });

  it('builds grouped error bars from sample standard deviation', () => {
    const rows: Row[] = [
      { category: 'A', revenue: 10 },
      { category: 'A', revenue: 20 },
      { category: 'A', revenue: 30 },
      { category: 'B', revenue: 5 },
    ];

    expect(buildErrorBarsModel(model, rows, { category: 'category', value: 'revenue' })).toEqual({
      categoryId: 'category',
      valueId: 'revenue',
      interval: 'stdev',
      items: [
        {
          key: 'A',
          label: 'A',
          count: 3,
          mean: 20,
          stdev: 10,
          lower: 10,
          upper: 30,
        },
        {
          key: 'B',
          label: 'B',
          count: 1,
          mean: 5,
          stdev: 0,
          lower: 5,
          upper: 5,
        },
      ],
    });
  });

  it('builds a linear forecast from the trend model', () => {
    const rows: Row[] = [
      { x: 1, revenue: 2 },
      { x: 2, revenue: 4 },
      { x: 3, revenue: 6 },
    ];

    expect(buildForecastModel(model, rows, { x: 'x', y: 'revenue', periods: 2, step: 1 })).toEqual({
      xId: 'x',
      yId: 'revenue',
      method: 'linear',
      slope: 2,
      intercept: 0,
      points: [
        { x: 4, y: 8 },
        { x: 5, y: 10 },
      ],
    });
  });

  it('builds deterministic k-means clusters over numeric fields', () => {
    const rows: Row[] = [
      { x: 1, revenue: 1 },
      { x: 2, revenue: 2 },
      { x: 10, revenue: 10 },
      { x: 11, revenue: 11 },
    ];

    expect(buildAnalyticsClusterModel(model, rows, { fields: ['x', 'revenue'], k: 2 })).toEqual({
      fields: ['x', 'revenue'],
      clusters: [
        {
          id: 'cluster:0',
          centroid: { x: 1.5, revenue: 1.5 },
          count: 2,
          rowIndices: [0, 1],
        },
        {
          id: 'cluster:1',
          centroid: { x: 10.5, revenue: 10.5 },
          count: 2,
          rowIndices: [2, 3],
        },
      ],
    });
  });

  it('validates fields and analytic options', () => {
    expect(() => buildReferenceLineModel(model, [], {})).toThrow(
      /Reference line requires either value or measure/,
    );
    expect(() => buildReferenceLineModel(model, [], { measure: 'ghost' })).toThrow(
      /Unknown reference line measure: ghost/,
    );
    expect(() =>
      buildPercentileBandModel(model, [], { value: 'revenue', lower: 0.9, upper: 0.1 }),
    ).toThrow(/Percentile band requires lower <= upper/);
    expect(() => buildTrendLineModel(model, [], { x: 'ghost', y: 'revenue' })).toThrow(
      /Unknown trend x field: ghost/,
    );
    expect(() =>
      buildErrorBarsModel(model, [], { category: 'category', value: 'ghost' }),
    ).toThrow(/Unknown error bars value field: ghost/);
    expect(() =>
      buildErrorBarsModel(model, [], {
        category: 'category',
        value: 'revenue',
        interval: 'mad' as unknown as 'stdev',
      }),
    ).toThrow(/Error bars interval must be stdev or stderr/);
    expect(() =>
      buildForecastModel(model, [], { x: 'x', y: 'revenue', periods: 0 }),
    ).toThrow(/Forecast periods must be a positive integer/);
    expect(() =>
      buildAnalyticsClusterModel(model, [], { fields: ['ghost'], k: 2 }),
    ).toThrow(/Unknown analytics cluster field: ghost/);
    expect(() =>
      buildAnalyticsClusterModel(model, [], { fields: ['x'], k: 0 }),
    ).toThrow(/Analytics cluster k must be a positive integer/);
  });
});
