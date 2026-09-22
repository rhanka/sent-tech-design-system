import { describe, it, expect } from 'vitest';
import { type DataModel, type Row, buildKpiCards } from './index.js';

const model: DataModel = {
  dimensions: [{ id: 'month', label: 'Month', type: 'discrete' }],
  measures: [
    { id: 'revenue', label: 'Revenue', aggregation: 'sum' },
    { id: 'orders', label: 'Orders', aggregation: 'count' },
  ],
};

const data: Row[] = [
  { month: 'Jan', revenue: 100, orders: 1 },
  { month: 'Jan', revenue: 50, orders: 1 },
  { month: 'Feb', revenue: 200, orders: 1 },
];

describe('buildKpiCards', () => {
  it('builds display cards from measure aggregation', () => {
    expect(buildKpiCards(model, data, [{ id: 'rev', measure: 'revenue' }])).toEqual([
      {
        id: 'rev',
        label: 'Revenue',
        measureId: 'revenue',
        value: 350,
      },
    ]);
  });

  it('supports multiple cards and custom labels', () => {
    expect(
      buildKpiCards(model, data, [
        { id: 'rev', label: 'Total revenue', measure: 'revenue' },
        { id: 'orders', measure: 'orders' },
      ]),
    ).toEqual([
      {
        id: 'rev',
        label: 'Total revenue',
        measureId: 'revenue',
        value: 350,
      },
      {
        id: 'orders',
        label: 'Orders',
        measureId: 'orders',
        value: 3,
      },
    ]);
  });

  it('computes delta vs comparison data', () => {
    const previous: Row[] = [{ month: 'Dec', revenue: 250, orders: 1 }];
    expect(
      buildKpiCards(
        model,
        data,
        [{ id: 'rev', measure: 'revenue' }],
        { comparisonData: previous },
      ),
    ).toEqual([
      {
        id: 'rev',
        label: 'Revenue',
        measureId: 'revenue',
        value: 350,
        comparisonValue: 250,
        delta: 100,
        deltaPercent: 0.4,
      },
    ]);
  });

  it('computes goal progress', () => {
    expect(buildKpiCards(model, data, [{ id: 'rev', measure: 'revenue', goal: 700 }])).toEqual([
      {
        id: 'rev',
        label: 'Revenue',
        measureId: 'revenue',
        value: 350,
        goal: 700,
        progress: 0.5,
      },
    ]);
  });

  it('builds a sparkline by dimension', () => {
    expect(
      buildKpiCards(model, data, [
        { id: 'rev', measure: 'revenue', sparklineDimension: 'month' },
      ]),
    ).toEqual([
      {
        id: 'rev',
        label: 'Revenue',
        measureId: 'revenue',
        value: 350,
        sparkline: [
          { key: 'Jan', value: 150 },
          { key: 'Feb', value: 200 },
        ],
      },
    ]);
  });

  it('validates measure and sparkline dimension ids', () => {
    expect(() => buildKpiCards(model, data, [{ id: 'x', measure: 'ghost' }])).toThrow(
      /Unknown KPI measure: ghost/,
    );
    expect(() =>
      buildKpiCards(model, data, [
        { id: 'x', measure: 'revenue', sparklineDimension: 'ghost' },
      ]),
    ).toThrow(/Unknown KPI sparkline dimension: ghost/);
  });
});
