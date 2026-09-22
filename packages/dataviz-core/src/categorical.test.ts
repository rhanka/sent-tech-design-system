import { describe, it, expect } from 'vitest';
import {
  type DataModel,
  type Row,
  buildCategoricalSeries,
  buildDivergingBarModel,
  buildParetoModel,
} from './index.js';

const model: DataModel = {
  dimensions: [
    { id: 'month', label: 'Month', type: 'discrete' },
    { id: 'region', label: 'Region', type: 'discrete' },
  ],
  measures: [
    { id: 'revenue', label: 'Revenue', aggregation: 'sum' },
    { id: 'orders', label: 'Orders', aggregation: 'count' },
  ],
};

const data: Row[] = [
  { month: 'Jan', region: 'EU', revenue: 100, orders: 1 },
  { month: 'Jan', region: 'NA', revenue: 50, orders: 1 },
  { month: 'Feb', region: 'EU', revenue: 200, orders: 1 },
  { month: 'Feb', region: 'NA', revenue: 100, orders: 1 },
];

describe('buildCategoricalSeries', () => {
  it('builds one categorical series per measure', () => {
    expect(
      buildCategoricalSeries(model, data, {
        category: 'month',
        measures: ['revenue', { id: 'orders', mark: 'line', axis: 'right' }],
      }),
    ).toEqual({
      categories: ['Jan', 'Feb'],
      mode: 'grouped',
      series: [
        {
          id: 'measure:revenue',
          label: 'Revenue',
          measureId: 'revenue',
          mark: 'bar',
          axis: 'left',
          values: [150, 300],
        },
        {
          id: 'measure:orders',
          label: 'Orders',
          measureId: 'orders',
          mark: 'line',
          axis: 'right',
          values: [2, 2],
        },
      ],
    });
  });

  it('splits a measure by series dimension in first-seen order', () => {
    expect(
      buildCategoricalSeries(model, data, {
        category: 'month',
        series: 'region',
        measures: ['revenue'],
      }),
    ).toEqual({
      categories: ['Jan', 'Feb'],
      mode: 'grouped',
      series: [
        {
          id: 'series:EU:revenue',
          label: 'EU · Revenue',
          measureId: 'revenue',
          seriesKey: 'EU',
          seriesLabel: 'EU',
          mark: 'bar',
          axis: 'left',
          values: [100, 200],
        },
        {
          id: 'series:NA:revenue',
          label: 'NA · Revenue',
          measureId: 'revenue',
          seriesKey: 'NA',
          seriesLabel: 'NA',
          mark: 'bar',
          axis: 'left',
          values: [50, 100],
        },
      ],
    });
  });

  it('normalizes stacked-100 values per category', () => {
    expect(
      buildCategoricalSeries(model, data, {
        category: 'month',
        series: 'region',
        measures: ['revenue'],
        mode: 'stacked-100',
      }).series.map((series) => series.values),
    ).toEqual([
      [100 / 150, 200 / 300],
      [50 / 150, 100 / 300],
    ]);
  });

  it('builds a Pareto model sorted by aggregate value with cumulative percentage', () => {
    expect(buildParetoModel(model, data, { category: 'region', measure: 'revenue' })).toEqual({
      categoryId: 'region',
      measureId: 'revenue',
      total: 450,
      items: [
        {
          key: 'EU',
          label: 'EU',
          value: 300,
          rank: 1,
          cumulativeValue: 300,
          cumulativePercent: 300 / 450,
        },
        {
          key: 'NA',
          label: 'NA',
          value: 150,
          rank: 2,
          cumulativeValue: 450,
          cumulativePercent: 1,
        },
      ],
    });
  });

  it('builds a diverging bar model with positive, negative and neutral bars', () => {
    const signedRows: Row[] = [
      { month: 'Jan', revenue: 100 },
      { month: 'Feb', revenue: -50 },
      { month: 'Mar', revenue: 0 },
    ];

    expect(buildDivergingBarModel(model, signedRows, { category: 'month', measure: 'revenue' })).toEqual({
      categoryId: 'month',
      measureId: 'revenue',
      baseline: 0,
      domain: [-50, 100],
      items: [
        { key: 'Jan', label: 'Jan', value: 100, start: 0, end: 100, direction: 'positive' },
        { key: 'Feb', label: 'Feb', value: -50, start: -50, end: 0, direction: 'negative' },
        { key: 'Mar', label: 'Mar', value: 0, start: 0, end: 0, direction: 'neutral' },
      ],
    });
  });

  it('validates category, series and measure ids', () => {
    expect(() =>
      buildCategoricalSeries(model, data, { category: 'ghost', measures: ['revenue'] }),
    ).toThrow(/Unknown categorical category dimension: ghost/);
    expect(() =>
      buildCategoricalSeries(model, data, {
        category: 'month',
        series: 'ghost',
        measures: ['revenue'],
      }),
    ).toThrow(/Unknown categorical series dimension: ghost/);
    expect(() =>
      buildCategoricalSeries(model, data, { category: 'month', measures: ['ghost'] }),
    ).toThrow(/Unknown categorical measure: ghost/);
    expect(() => buildParetoModel(model, data, { category: 'ghost', measure: 'revenue' })).toThrow(
      /Unknown Pareto category dimension: ghost/,
    );
    expect(() =>
      buildDivergingBarModel(model, data, { category: 'month', measure: 'ghost' }),
    ).toThrow(/Unknown diverging bar measure: ghost/);
  });
});
