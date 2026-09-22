import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildDensity2DData } from './density2d.js';

const model: DataModel = {
  dimensions: [],
  measures: [
    { id: 'x', label: 'X', aggregation: 'avg' },
    { id: 'y', label: 'Y', aggregation: 'avg' },
    { id: 'w', label: 'Poids', aggregation: 'sum' },
  ],
};

const config = { x: 'x', y: 'y' };

describe('buildDensity2DData', () => {
  it('maps x and y fields per row', () => {
    const rows: Row[] = [
      { x: 1, y: 2 },
      { x: 3, y: 4 },
    ];
    const result = buildDensity2DData(model, rows, config);
    expect(result).toEqual([
      { x: 1, y: 2 },
      { x: 3, y: 4 },
    ]);
  });

  it('drops rows where x or y is non-finite', () => {
    const rows: Row[] = [
      { x: 1, y: 2 },
      { x: null, y: 5 },
      { x: 6, y: NaN },
      { x: undefined, y: undefined },
      { x: 7, y: 8 },
    ];
    const result = buildDensity2DData(model, rows, config);
    expect(result).toEqual([
      { x: 1, y: 2 },
      { x: 7, y: 8 },
    ]);
  });

  it('omits the weight key when no weight field is configured', () => {
    const rows: Row[] = [{ x: 1, y: 2, w: 9 }];
    const result = buildDensity2DData(model, rows, config);
    expect(result[0]).toEqual({ x: 1, y: 2 });
    expect('weight' in result[0]!).toBe(false);
  });

  it('includes weight when a weight field is configured and finite', () => {
    const rows: Row[] = [
      { x: 1, y: 2, w: 9 },
      { x: 3, y: 4, w: 0 },
    ];
    const result = buildDensity2DData(model, rows, { x: 'x', y: 'y', weight: 'w' });
    expect(result).toEqual([
      { x: 1, y: 2, weight: 9 },
      { x: 3, y: 4, weight: 0 },
    ]);
  });

  it('omits the weight key when the configured weight is non-finite', () => {
    const rows: Row[] = [
      { x: 1, y: 2, w: null },
      { x: 3, y: 4, w: NaN },
    ];
    const result = buildDensity2DData(model, rows, { x: 'x', y: 'y', weight: 'w' });
    expect(result[0]).toEqual({ x: 1, y: 2 });
    expect('weight' in result[0]!).toBe(false);
    expect(result[1]).toEqual({ x: 3, y: 4 });
  });

  it('coerces boolean and numeric-string coordinates', () => {
    const rows: Row[] = [
      { x: '1.5', y: '2.5' },
      { x: true, y: false },
    ];
    const result = buildDensity2DData(model, rows, config);
    expect(result).toEqual([
      { x: 1.5, y: 2.5 },
      { x: 1, y: 0 },
    ]);
  });

  it('coerces a numeric-string weight', () => {
    const rows: Row[] = [{ x: 1, y: 2, w: '3.5' }];
    const result = buildDensity2DData(model, rows, { x: 'x', y: 'y', weight: 'w' });
    expect(result[0]).toEqual({ x: 1, y: 2, weight: 3.5 });
  });
});
