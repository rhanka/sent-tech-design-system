import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildOhlcData } from './ohlc.js';

const model: DataModel = {
  dimensions: [{ id: 'session', label: 'Séance', type: 'discrete' }],
  measures: [
    { id: 'open', label: 'Ouverture', aggregation: 'avg' },
    { id: 'high', label: 'Plus haut', aggregation: 'avg' },
    { id: 'low', label: 'Plus bas', aggregation: 'avg' },
    { id: 'close', label: 'Clôture', aggregation: 'avg' },
  ],
};

const rows: Row[] = [
  { session: '02 jan', open: 142.50, high: 146.80, low: 141.20, close: 145.30 },
  { session: '03 jan', open: 145.30, high: 148.50, low: 143.00, close: 144.10 },
];

const config = { label: 'session', open: 'open', high: 'high', low: 'low', close: 'close' };

describe('buildOhlcData', () => {
  it('maps OHLC fields and label per row', () => {
    const result = buildOhlcData(model, rows, config);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ label: '02 jan', open: 142.50, high: 146.80, low: 141.20, close: 145.30 });
    expect(result[1]).toEqual({ label: '03 jan', open: 145.30, high: 148.50, low: 143.00, close: 144.10 });
  });

  it('skips rows where any OHLC value is non-finite', () => {
    const sparseRows: Row[] = [
      { session: '02 jan', open: 142.50, high: 146.80, low: 141.20, close: 145.30 },
      { session: '03 jan', open: null, high: 148.50, low: 143.00, close: 144.10 },
      { session: '04 jan', open: 144.10, high: NaN, low: 142.60, close: 146.80 },
    ];
    const result = buildOhlcData(model, sparseRows, config);
    expect(result).toHaveLength(1);
    expect(result[0]!.label).toBe('02 jan');
  });

  it('coerces the label field to a string', () => {
    const numericRows: Row[] = [
      { session: 20240102, open: 142.50, high: 146.80, low: 141.20, close: 145.30 },
    ];
    const result = buildOhlcData(model, numericRows, config);
    expect(result[0]!.label).toBe('20240102');
  });
});
