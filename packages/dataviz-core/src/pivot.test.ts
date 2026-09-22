import { describe, it, expect } from 'vitest';
import { type DataModel, type Row, buildPivotTable } from './index.js';

const model: DataModel = {
  dimensions: [
    { id: 'country', label: 'Country', type: 'discrete' },
    { id: 'category', label: 'Category', type: 'discrete' },
  ],
  measures: [
    { id: 'revenue', label: 'Revenue', aggregation: 'sum' },
    { id: 'orders', label: 'Orders', aggregation: 'count' },
  ],
};

const data: Row[] = [
  { country: 'FR', category: 'A', revenue: 100, orders: 1 },
  { country: 'FR', category: 'B', revenue: 50, orders: 1 },
  { country: 'US', category: 'A', revenue: 200, orders: 1 },
  { country: 'US', category: 'B', revenue: 25, orders: 1 },
  { country: 'US', category: 'B', revenue: 75, orders: 1 },
];

describe('buildPivotTable', () => {
  it('aggregates one row dimension and one measure into DataTable-compatible rows', () => {
    const table = buildPivotTable(model, data, {
      rows: ['country'],
      measures: ['revenue'],
    });

    expect(table.columns).toEqual([
      { key: 'row:country', label: 'Country', kind: 'row' },
      { key: 'value:revenue', label: 'Revenue', kind: 'value', measureId: 'revenue' },
    ]);
    expect(table.rows).toEqual([
      { id: 'FR', 'row:country': 'FR', 'value:revenue': 150 },
      { id: 'US', 'row:country': 'US', 'value:revenue': 300 },
    ]);
  });

  it('builds a row by column matrix in first-seen column order', () => {
    const table = buildPivotTable(model, data, {
      rows: ['country'],
      columns: ['category'],
      measures: ['revenue'],
    });

    expect(table.columns).toEqual([
      { key: 'row:country', label: 'Country', kind: 'row' },
      {
        key: 'value:A:revenue',
        label: 'A · Revenue',
        kind: 'value',
        columnKey: 'A',
        columnLabel: 'A',
        measureId: 'revenue',
      },
      {
        key: 'value:B:revenue',
        label: 'B · Revenue',
        kind: 'value',
        columnKey: 'B',
        columnLabel: 'B',
        measureId: 'revenue',
      },
    ]);
    expect(table.rows).toEqual([
      { id: 'FR', 'row:country': 'FR', 'value:A:revenue': 100, 'value:B:revenue': 50 },
      { id: 'US', 'row:country': 'US', 'value:A:revenue': 200, 'value:B:revenue': 100 },
    ]);
  });

  it('supports multiple measures', () => {
    const table = buildPivotTable(model, data, {
      rows: ['country'],
      measures: ['revenue', 'orders'],
    });

    expect(table.columns.map((column) => column.key)).toEqual([
      'row:country',
      'value:revenue',
      'value:orders',
    ]);
    expect(table.rows).toEqual([
      { id: 'FR', 'row:country': 'FR', 'value:revenue': 150, 'value:orders': 2 },
      { id: 'US', 'row:country': 'US', 'value:revenue': 300, 'value:orders': 3 },
    ]);
  });

  it('validates dimensions and measures before aggregating', () => {
    expect(() =>
      buildPivotTable(model, data, { rows: ['ghost'], measures: ['revenue'] }),
    ).toThrow(/Unknown pivot row dimension: ghost/);
    expect(() =>
      buildPivotTable(model, data, { rows: ['country'], columns: ['ghost'], measures: ['revenue'] }),
    ).toThrow(/Unknown pivot column dimension: ghost/);
    expect(() =>
      buildPivotTable(model, data, { rows: ['country'], measures: ['ghost'] }),
    ).toThrow(/Unknown pivot measure: ghost/);
  });
});
