import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildRenkoData } from './renko.js';

const model: DataModel = {
  dimensions: [],
  measures: [
    { id: 'date', label: 'Date', aggregation: 'sum' },
    { id: 'close', label: 'Clôture', aggregation: 'sum' },
  ],
};

const config = { date: 'date', close: 'close' };

describe('buildRenkoData', () => {
  it('maps date and close fields per row', () => {
    const rows: Row[] = [
      { date: 1718500000000, close: 100 },
      { date: 1718586400000, close: 102 },
    ];
    const result = buildRenkoData(model, rows, config);
    expect(result).toEqual([
      { date: 1718500000000, close: 100 },
      { date: 1718586400000, close: 102 },
    ]);
  });

  it('drops rows where date or close is non-finite', () => {
    const rows: Row[] = [
      { date: 1, close: 100 },
      { date: null, close: 105 },
      { date: 3, close: NaN },
      { date: undefined, close: undefined },
      { date: 5, close: 110 },
    ];
    const result = buildRenkoData(model, rows, config);
    expect(result).toEqual([
      { date: 1, close: 100 },
      { date: 5, close: 110 },
    ]);
  });

  it('coerces boolean and numeric-string values', () => {
    const rows: Row[] = [
      { date: '1.5', close: '2.5' },
      { date: true, close: false },
    ];
    const result = buildRenkoData(model, rows, config);
    expect(result).toEqual([
      { date: 1.5, close: 2.5 },
      { date: 1, close: 0 },
    ]);
  });

  it('returns an empty array for empty rows', () => {
    const result = buildRenkoData(model, [], config);
    expect(result).toEqual([]);
  });
});
