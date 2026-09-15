import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildScatterMatrix } from './scatterMatrix.js';

const model: DataModel = {
  dimensions: [],
  measures: [
    { id: 'price', label: 'Prix', aggregation: 'avg' },
    { id: 'units', label: 'Unités', aggregation: 'sum' },
    { id: 'revenue', label: 'Revenu', aggregation: 'sum' },
  ],
};

const rows: Row[] = [
  { price: 10, units: 2, revenue: 20 },
  { price: 20, units: 4, revenue: 80 },
  { price: 15, units: 3, revenue: 45 },
];

describe('buildScatterMatrix', () => {
  it('produces N² cells for N measures', () => {
    const result = buildScatterMatrix(model, rows, { measures: ['price', 'units', 'revenue'] });
    expect(result.cells).toHaveLength(9);
    expect(result.measures).toEqual(['price', 'units', 'revenue']);
  });

  it('cell (row=0, col=1) has x=units, y=price', () => {
    const result = buildScatterMatrix(model, rows, { measures: ['price', 'units'] });
    const cell = result.cells.find((c) => c.row === 0 && c.col === 1)!;
    expect(cell.xLabel).toBe('Unités');
    expect(cell.yLabel).toBe('Prix');
    expect(cell.data[0]).toEqual({ x: 2, y: 10 });
  });

  it('diagonal cell (row=i, col=i) crosses the measure with itself', () => {
    const result = buildScatterMatrix(model, rows, { measures: ['price', 'units'] });
    const diag = result.cells.find((c) => c.row === 0 && c.col === 0)!;
    expect(diag.xLabel).toBe('Prix');
    expect(diag.yLabel).toBe('Prix');
  });

  it('cells are in row-major order', () => {
    const result = buildScatterMatrix(model, rows, { measures: ['price', 'units'] });
    expect(result.cells.map((c) => `${c.row},${c.col}`)).toEqual(['0,0', '0,1', '1,0', '1,1']);
  });

  it('returns empty cells array when no measures provided', () => {
    const result = buildScatterMatrix(model, rows, { measures: [] });
    expect(result.cells).toHaveLength(0);
  });
});
