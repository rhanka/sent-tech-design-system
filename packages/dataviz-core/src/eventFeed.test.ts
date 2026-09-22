import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildEventFeedData } from './eventFeed.js';

const model: DataModel = {
  dimensions: [
    { id: 'type', label: 'Type', type: 'discrete' },
    { id: 'severity', label: 'Sévérité', type: 'discrete' },
    { id: 'message', label: 'Message', type: 'discrete' },
  ],
  measures: [
    { id: 'at', label: 'Horodatage', aggregation: 'sum' },
  ],
};

const rows: Row[] = [
  { at: 1718500000000, type: 'deploy', severity: 'success', message: 'Release v1.2.0 déployée' },
  { at: 1718500060000, type: 'alert', severity: 'warning', message: 'Latence p95 élevée' },
  { at: 1718500120000, type: 'rollback', severity: 'error', message: 'Rollback automatique' },
];

const config = { at: 'at', type: 'type', severity: 'severity', message: 'message' };

describe('buildEventFeedData', () => {
  it('maps at, type, severity and message fields per row', () => {
    const result = buildEventFeedData(model, rows, config);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      at: 1718500000000,
      type: 'deploy',
      severity: 'success',
      message: 'Release v1.2.0 déployée',
    });
    expect(result[2]).toEqual({
      at: 1718500120000,
      type: 'rollback',
      severity: 'error',
      message: 'Rollback automatique',
    });
  });

  it('does not sort — preserves input order', () => {
    const unsorted: Row[] = [
      { at: 30, type: 'a', severity: 'info', message: 'm3' },
      { at: 10, type: 'b', severity: 'info', message: 'm1' },
      { at: 20, type: 'c', severity: 'info', message: 'm2' },
    ];
    const result = buildEventFeedData(model, unsorted, config);
    expect(result.map((e) => e.at)).toEqual([30, 10, 20]);
  });

  it('drops rows where at is non-finite', () => {
    const sparseRows: Row[] = [
      { at: 1718500000000, type: 'deploy', severity: 'info', message: 'ok' },
      { at: null, type: 'alert', severity: 'warning', message: 'no ts' },
      { at: NaN, type: 'alert', severity: 'warning', message: 'nan' },
      { at: undefined, type: 'alert', severity: 'warning', message: 'undef' },
    ];
    const result = buildEventFeedData(model, sparseRows, config);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ at: 1718500000000, type: 'deploy' });
  });

  it('defaults severity to "info" when null or undefined', () => {
    const nullSeverity: Row[] = [
      { at: 10, type: 'deploy', severity: null, message: 'm' },
      { at: 20, type: 'deploy', severity: undefined, message: 'm' },
    ];
    const result = buildEventFeedData(model, nullSeverity, config);
    expect(result[0]!.severity).toBe('info');
    expect(result[1]!.severity).toBe('info');
  });

  it('coerces type, severity and message to strings', () => {
    const numericRows: Row[] = [
      { at: 10, type: 42, severity: 7, message: 99 },
    ];
    const result = buildEventFeedData(model, numericRows, config);
    expect(result[0]!.type).toBe('42');
    expect(result[0]!.severity).toBe('7');
    expect(result[0]!.message).toBe('99');
  });

  it('defaults type and message to empty string when null or undefined', () => {
    const sparse: Row[] = [
      { at: 10, type: null, severity: 'warning', message: undefined },
    ];
    const result = buildEventFeedData(model, sparse, config);
    expect(result[0]!.type).toBe('');
    expect(result[0]!.message).toBe('');
  });

  it('coerces a numeric at from a string', () => {
    const stringTs: Row[] = [
      { at: '1718500000000', type: 'deploy', severity: 'info', message: 'm' },
    ];
    const result = buildEventFeedData(model, stringTs, config);
    expect(typeof result[0]!.at).toBe('number');
    expect(result[0]!.at).toBe(1718500000000);
  });

  it('returns an empty array for empty rows', () => {
    expect(buildEventFeedData(model, [], config)).toEqual([]);
  });
});
