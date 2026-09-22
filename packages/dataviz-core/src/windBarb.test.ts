import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildWindBarbData } from './windBarb.js';

const model: DataModel = {
  dimensions: [],
  measures: [
    { id: 'at', label: 'Heure', aggregation: 'sum' },
    { id: 'speed', label: 'Vitesse (nœuds)', aggregation: 'avg' },
    { id: 'direction', label: 'Direction (°)', aggregation: 'avg' },
  ],
};

const config = { at: 'at', speed: 'speed', direction: 'direction' };

describe('buildWindBarbData', () => {
  it('maps the at, speed and direction fields per row', () => {
    const rows: Row[] = [
      { at: 1, speed: 12, direction: 90 },
      { at: 2, speed: 34, direction: 180 },
    ];
    const result = buildWindBarbData(model, rows, config);
    expect(result).toEqual([
      { at: 1, speed: 12, direction: 90 },
      { at: 2, speed: 34, direction: 180 },
    ]);
  });

  it('drops rows where any of at, speed or direction is non-finite', () => {
    const rows: Row[] = [
      { at: 1, speed: 12, direction: 90 },
      { at: null, speed: 5, direction: 0 },
      { at: 3, speed: NaN, direction: 45 },
      { at: 4, speed: 8, direction: undefined },
      { at: 5, speed: 16, direction: 270 },
    ];
    const result = buildWindBarbData(model, rows, config);
    expect(result).toEqual([
      { at: 1, speed: 12, direction: 90 },
      { at: 5, speed: 16, direction: 270 },
    ]);
  });

  it('coerces boolean and numeric-string fields', () => {
    const rows: Row[] = [
      { at: '1.5', speed: '3.5', direction: '45' },
      { at: true, speed: false, direction: true },
    ];
    const result = buildWindBarbData(model, rows, config);
    expect(result).toEqual([
      { at: 1.5, speed: 3.5, direction: 45 },
      { at: 1, speed: 0, direction: 1 },
    ]);
  });

  it('returns an empty array for empty rows', () => {
    expect(buildWindBarbData(model, [], config)).toEqual([]);
  });
});
