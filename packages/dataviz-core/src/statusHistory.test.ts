import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildStatusHistoryData } from './statusHistory.js';

const model: DataModel = {
  dimensions: [
    { id: 'service', label: 'Service', type: 'discrete' },
    { id: 'status',  label: 'Statut',  type: 'discrete' },
  ],
  measures: [
    { id: 'at', label: 'Heure', aggregation: 'min' },
  ],
};

const rows: Row[] = [
  { service: 'API',      at: 0,  status: 'ok'   },
  { service: 'API',      at: 1,  status: 'warn' },
  { service: 'API',      at: 2,  status: 'ok'   },
  { service: 'Database', at: 0,  status: 'ok'   },
  { service: 'Database', at: 1,  status: 'crit' },
  { service: 'Database', at: 2,  status: 'ok'   },
];

const config = { series: 'service', at: 'at', value: 'status' };

describe('buildStatusHistoryData', () => {
  it('groups rows by series into two lanes', () => {
    const result = buildStatusHistoryData(model, rows, config);
    expect(result).toHaveLength(2);
    expect(result[0]!.series).toBe('API');
    expect(result[1]!.series).toBe('Database');
  });

  it('maps buckets correctly within each series', () => {
    const result = buildStatusHistoryData(model, rows, config);
    const api = result[0]!;
    expect(api.buckets).toHaveLength(3);
    expect(api.buckets[0]).toEqual({ at: 0, value: 'ok' });
    expect(api.buckets[1]).toEqual({ at: 1, value: 'warn' });
    expect(api.buckets[2]).toEqual({ at: 2, value: 'ok' });
  });

  it('drops rows where at is non-finite', () => {
    const sparseRows: Row[] = [
      { service: 'API', at: 0,    status: 'ok'   },
      { service: 'API', at: null, status: 'warn' },
      { service: 'API', at: NaN,  status: 'crit' },
    ];
    const result = buildStatusHistoryData(model, sparseRows, config);
    expect(result).toHaveLength(1);
    expect(result[0]!.buckets).toHaveLength(1);
    expect(result[0]!.buckets[0]!.value).toBe('ok');
  });

  it('sorts buckets by ascending at within a series', () => {
    const unorderedRows: Row[] = [
      { service: 'API', at: 5, status: 'warn' },
      { service: 'API', at: 0, status: 'ok'   },
    ];
    const result = buildStatusHistoryData(model, unorderedRows, config);
    const buckets = result[0]!.buckets;
    expect(buckets[0]!.at).toBe(0);
    expect(buckets[1]!.at).toBe(5);
  });

  it('coerces value field to string', () => {
    const numericValueRows: Row[] = [{ service: 'API', at: 0, status: 1 }];
    const result = buildStatusHistoryData(model, numericValueRows, config);
    expect(result[0]!.buckets[0]!.value).toBe('1');
  });
});
