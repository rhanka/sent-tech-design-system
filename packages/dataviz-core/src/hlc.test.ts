import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildHlcData } from './hlc.js';

const model: DataModel = {
  dimensions: [
    { id: 'session', label: 'Séance', type: 'discrete' },
  ],
  measures: [
    { id: 'high', label: 'Plus haut', aggregation: 'sum' },
    { id: 'low', label: 'Plus bas', aggregation: 'sum' },
    { id: 'close', label: 'Clôture', aggregation: 'sum' },
  ],
};

const rows: Row[] = [
  { session: '2024-01-02', high: 115, low: 95, close: 110 },
  { session: '2024-01-03', high: 120, low: 105, close: 108 },
  { session: '2024-01-04', high: 125, low: 100, close: 122 },
];

const config = { label: 'session', high: 'high', low: 'low', close: 'close' };

describe('buildHlcData', () => {
  it('maps HLC fields and label per row', () => {
    const result = buildHlcData(model, rows, config);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ label: '2024-01-02', high: 115, low: 95, close: 110 });
    expect(result[1]).toEqual({ label: '2024-01-03', high: 120, low: 105, close: 108 });
    expect(result[2]).toEqual({ label: '2024-01-04', high: 125, low: 100, close: 122 });
  });

  it('skips rows where any HLC value is non-finite', () => {
    const sparseRows: Row[] = [
      { session: '2024-01-02', high: 115, low: 95, close: 110 },
      { session: '2024-01-03', high: NaN, low: 105, close: 108 },
      { session: '2024-01-04', high: 125, low: null, close: 122 },
      { session: '2024-01-05', high: 118, low: 110, close: undefined },
    ];
    const result = buildHlcData(model, sparseRows, config);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ label: '2024-01-02', high: 115, low: 95, close: 110 });
  });

  it('coerces the label field to a string', () => {
    const numericLabelRows: Row[] = [
      { session: 20240102, high: 115, low: 95, close: 110 },
    ];
    const result = buildHlcData(model, numericLabelRows, config);
    expect(result[0]!.label).toBe('20240102');
  });
});
