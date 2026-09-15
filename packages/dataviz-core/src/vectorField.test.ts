import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildVectorFieldData } from './vectorField.js';

const model: DataModel = {
  dimensions: [],
  measures: [
    { id: 'x', label: 'X', aggregation: 'avg' },
    { id: 'y', label: 'Y', aggregation: 'avg' },
    { id: 'length', label: 'Magnitude', aggregation: 'avg' },
    { id: 'direction', label: 'Direction (°)', aggregation: 'avg' },
  ],
};

const config = { x: 'x', y: 'y', length: 'length', direction: 'direction' };

describe('buildVectorFieldData', () => {
  it('maps the four numeric fields per row', () => {
    const rows: Row[] = [
      { x: 1, y: 2, length: 3, direction: 90 },
      { x: 4, y: 5, length: 6, direction: 180 },
    ];
    const result = buildVectorFieldData(model, rows, config);
    expect(result).toEqual([
      { x: 1, y: 2, length: 3, direction: 90 },
      { x: 4, y: 5, length: 6, direction: 180 },
    ]);
  });

  it('drops rows where any of x, y, length or direction is non-finite', () => {
    const rows: Row[] = [
      { x: 1, y: 2, length: 3, direction: 90 },
      { x: null, y: 5, length: 6, direction: 0 },
      { x: 7, y: NaN, length: 8, direction: 45 },
      { x: 9, y: 10, length: undefined, direction: 30 },
      { x: 11, y: 12, length: 13, direction: NaN },
      { x: 14, y: 15, length: 16, direction: 270 },
    ];
    const result = buildVectorFieldData(model, rows, config);
    expect(result).toEqual([
      { x: 1, y: 2, length: 3, direction: 90 },
      { x: 14, y: 15, length: 16, direction: 270 },
    ]);
  });

  it('coerces boolean and numeric-string fields', () => {
    const rows: Row[] = [
      { x: '1.5', y: '2.5', length: '3.5', direction: '45' },
      { x: true, y: false, length: true, direction: false },
    ];
    const result = buildVectorFieldData(model, rows, config);
    expect(result).toEqual([
      { x: 1.5, y: 2.5, length: 3.5, direction: 45 },
      { x: 1, y: 0, length: 1, direction: 0 },
    ]);
  });

  it('returns an empty array for empty rows', () => {
    expect(buildVectorFieldData(model, [], config)).toEqual([]);
  });
});
