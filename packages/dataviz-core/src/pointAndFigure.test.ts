import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildPointAndFigureData } from './pointAndFigure.js';

const model: DataModel = {
  dimensions: [],
  measures: [
    { id: 'date', label: 'Date', aggregation: 'sum' },
    { id: 'close', label: 'Clôture', aggregation: 'sum' },
  ],
};

const config = { date: 'date', close: 'close' };

describe('buildPointAndFigureData', () => {
  it('maps date and close fields per row', () => {
    const rows: Row[] = [
      { date: 1, close: 50 },
      { date: 2, close: 52 },
    ];
    const result = buildPointAndFigureData(model, rows, config);
    expect(result).toEqual([
      { date: 1, close: 50 },
      { date: 2, close: 52 },
    ]);
  });

  it('drops rows where date or close is non-finite', () => {
    const rows: Row[] = [
      { date: 1, close: 50 },
      { date: null, close: 51 },
      { date: 3, close: NaN },
      { date: undefined, close: undefined },
      { date: 4, close: 53 },
    ];
    const result = buildPointAndFigureData(model, rows, config);
    expect(result).toEqual([
      { date: 1, close: 50 },
      { date: 4, close: 53 },
    ]);
  });

  it('coerces boolean and numeric-string fields', () => {
    const rows: Row[] = [
      { date: '1.5', close: '49.5' },
      { date: true, close: false },
    ];
    const result = buildPointAndFigureData(model, rows, config);
    expect(result).toEqual([
      { date: 1.5, close: 49.5 },
      { date: 1, close: 0 },
    ]);
  });

  it('returns an empty array for empty rows', () => {
    const result = buildPointAndFigureData(model, [], config);
    expect(result).toEqual([]);
  });
});
