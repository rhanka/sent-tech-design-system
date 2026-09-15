import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildPolygonData } from './polygon.js';

const model: DataModel = {
  dimensions: [],
  measures: [
    { id: 'x', label: 'X', aggregation: 'sum' },
    { id: 'y', label: 'Y', aggregation: 'sum' },
  ],
};

const rows: Row[] = [
  { x: 0, y: 0 },
  { x: 5, y: 10 },
  { x: 10, y: 5 },
  { x: 5, y: 0 },
];

const config = { x: 'x', y: 'y' };

describe('buildPolygonData', () => {
  it('maps x and y numeric fields into polygon points', () => {
    const result = buildPolygonData(model, rows, config);
    expect(result).toHaveLength(4);
    expect(result[0]).toEqual({ x: 0, y: 0 });
    expect(result[1]).toEqual({ x: 5, y: 10 });
    expect(result[2]).toEqual({ x: 10, y: 5 });
    expect(result[3]).toEqual({ x: 5, y: 0 });
  });

  it('drops rows where x or y is non-finite', () => {
    const sparseRows: Row[] = [
      { x: 0, y: 0 },
      { x: null, y: 10 },
      { x: 10, y: NaN },
      { x: undefined, y: undefined },
      { x: 5, y: 0 },
    ];
    const result = buildPolygonData(model, sparseRows, config);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ x: 0, y: 0 });
    expect(result[1]).toEqual({ x: 5, y: 0 });
  });

  it('coerces string-encoded numeric x and y values', () => {
    const stringRows: Row[] = [
      { x: '3.5', y: '7.2' },
    ];
    const result = buildPolygonData(model, stringRows, config);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ x: 3.5, y: 7.2 });
  });
});
