import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildTileMapData } from './tilemap.js';

const model: DataModel = {
  dimensions: [
    { id: 'region', label: 'Région', type: 'discrete' },
  ],
  measures: [
    { id: 'col', label: 'Colonne', aggregation: 'avg' },
    { id: 'row', label: 'Ligne', aggregation: 'avg' },
    { id: 'revenue', label: 'Revenu', aggregation: 'sum' },
  ],
};

const rows: Row[] = [
  { region: 'Nord', col: 2, row: 0, revenue: 420 },
  { region: 'Sud', col: 2, row: 4, revenue: 310 },
  { region: 'Est', col: 4, row: 2, revenue: 550 },
];

const config = { label: 'region', col: 'col', row: 'row', value: 'revenue' };

describe('buildTileMapData', () => {
  it('maps label/col/row/value per tile row', () => {
    const result = buildTileMapData(model, rows, config);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ label: 'Nord', col: 2, row: 0, value: 420 });
    expect(result[1]).toEqual({ label: 'Sud', col: 2, row: 4, value: 310 });
    expect(result[2]).toEqual({ label: 'Est', col: 4, row: 2, value: 550 });
  });

  it('skips rows where col, row, or value is non-finite', () => {
    const sparseRows: Row[] = [
      { region: 'Nord', col: 2, row: 0, revenue: 420 },
      { region: 'Sud', col: null, row: 4, revenue: 310 },
      { region: 'Est', col: 4, row: NaN, revenue: 550 },
      { region: 'Ouest', col: 0, row: 2, revenue: null },
    ];
    const result = buildTileMapData(model, sparseRows, config);
    expect(result).toHaveLength(1);
    expect(result[0]!.label).toBe('Nord');
  });

  it('coerces label to string', () => {
    const numericRows: Row[] = [{ region: 99, col: 0, row: 0, revenue: 100 }];
    const result = buildTileMapData(model, numericRows, config);
    expect(result[0]!.label).toBe('99');
  });
});
