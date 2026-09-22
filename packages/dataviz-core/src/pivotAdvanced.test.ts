import { describe, it, expect } from 'vitest';
import { type DataModel, type Row, buildAdvancedPivotTable } from './index.js';

const model: DataModel = {
  dimensions: [
    { id: 'country', label: 'Country', type: 'discrete' },
    { id: 'category', label: 'Category', type: 'discrete' },
    { id: 'channel', label: 'Channel', type: 'discrete' },
    { id: 'month', label: 'Month', type: 'discrete' },
  ],
  measures: [{ id: 'revenue', label: 'Revenue', aggregation: 'sum' }],
};

const data: Row[] = [
  { country: 'FR', category: 'A', channel: 'web', month: 'Jan', revenue: 100 },
  { country: 'FR', category: 'B', channel: 'web', month: 'Feb', revenue: 50 },
  { country: 'US', category: 'A', channel: 'store', month: 'Jan', revenue: 200 },
  { country: 'US', category: 'B', channel: 'store', month: 'Feb', revenue: 100 },
];

describe('buildAdvancedPivotTable', () => {
  it('adds subtotal rows before leaf rows in first-seen hierarchy order', () => {
    const table = buildAdvancedPivotTable(model, data, {
      rows: ['country', 'category'],
      measures: ['revenue'],
      includeSubtotals: true,
    });

    expect(table.rows.map((row) => [row.id, row.kind, row.depth, row.labels])).toEqual([
      ['FR', 'subtotal', 0, { country: 'FR' }],
      ['FR\u001fA', 'leaf', 1, { country: 'FR', category: 'A' }],
      ['FR\u001fB', 'leaf', 1, { country: 'FR', category: 'B' }],
      ['US', 'subtotal', 0, { country: 'US' }],
      ['US\u001fA', 'leaf', 1, { country: 'US', category: 'A' }],
      ['US\u001fB', 'leaf', 1, { country: 'US', category: 'B' }],
    ]);
    expect(table.rows[0]!.values['value:revenue']).toMatchObject({
      key: 'value:revenue',
      measureId: 'revenue',
      value: 150,
    });
    expect(table.rows[3]!.values['value:revenue']).toMatchObject({ value: 300 });
  });

  it('hides descendants of collapsed subtotal paths', () => {
    const table = buildAdvancedPivotTable(model, data, {
      rows: ['country', 'category'],
      measures: ['revenue'],
      includeSubtotals: true,
      collapsedRowPaths: ['FR'],
    });

    expect(table.rows.map((row) => [row.id, row.kind, row.expanded])).toEqual([
      ['FR', 'subtotal', false],
      ['US', 'subtotal', true],
      ['US\u001fA', 'leaf', false],
      ['US\u001fB', 'leaf', false],
    ]);
  });

  it('adds heat metadata and cell sparklines for value cells', () => {
    const table = buildAdvancedPivotTable(model, data, {
      rows: ['country'],
      columns: ['channel'],
      measures: ['revenue'],
      heatmap: true,
      sparklineDimension: 'month',
    });

    expect(table.columns.map((column) => column.key)).toEqual([
      'row:country',
      'value:web:revenue',
      'value:store:revenue',
    ]);
    expect(table.heatDomain).toEqual([0, 300]);
    expect(table.rows[0]!.values['value:web:revenue']).toEqual({
      key: 'value:web:revenue',
      measureId: 'revenue',
      columnKey: 'web',
      columnLabel: 'web',
      value: 150,
      heat: 0.5,
      sparkline: [
        { key: 'Jan', value: 100 },
        { key: 'Feb', value: 50 },
      ],
    });
    expect(table.rows[0]!.values['value:store:revenue']).toMatchObject({
      value: 0,
      heat: 0,
      sparkline: [],
    });
    expect(table.rows[1]!.values['value:store:revenue']).toMatchObject({
      value: 300,
      heat: 1,
    });
  });

  it('validates dimensions and measures before building', () => {
    expect(() =>
      buildAdvancedPivotTable(model, data, { rows: [], measures: ['revenue'] }),
    ).toThrow(/Advanced pivot requires at least one row dimension/);
    expect(() =>
      buildAdvancedPivotTable(model, data, { rows: ['ghost'], measures: ['revenue'] }),
    ).toThrow(/Unknown advanced pivot row dimension: ghost/);
    expect(() =>
      buildAdvancedPivotTable(model, data, { rows: ['country'], columns: ['ghost'], measures: ['revenue'] }),
    ).toThrow(/Unknown advanced pivot column dimension: ghost/);
    expect(() =>
      buildAdvancedPivotTable(model, data, { rows: ['country'], measures: ['ghost'] }),
    ).toThrow(/Unknown advanced pivot measure: ghost/);
    expect(() =>
      buildAdvancedPivotTable(model, data, {
        rows: ['country'],
        measures: ['revenue'],
        sparklineDimension: 'ghost',
      }),
    ).toThrow(/Unknown advanced pivot sparkline dimension: ghost/);
  });
});
