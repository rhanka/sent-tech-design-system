import { describe, expect, it } from 'vitest';
import { buildQueryFilterSpec, type DataModel, type Row } from './index.js';

const model: DataModel = {
  dimensions: [
    { id: 'service', label: 'Service', type: 'discrete' },
    { id: 'message', label: 'Message', type: 'discrete' },
    { id: 'severity', label: 'Severity', type: 'discrete' },
  ],
  measures: [{ id: 'latency', label: 'Latency', aggregation: 'avg' }],
};

const rows: Row[] = [
  { service: 'checkout', message: 'payment accepted', severity: 'info', latency: 120 },
  { service: 'billing', message: 'payment retried', severity: 'warning', latency: 310 },
  { service: 'auth', message: 'token refreshed', severity: 'info', latency: 45 },
];

describe('buildQueryFilterSpec', () => {
  it('returns include values for the target dimension when any searched field matches', () => {
    expect(
      buildQueryFilterSpec(model, rows, {
        dimension: 'service',
        fields: ['message', 'severity'],
        query: 'payment',
      }),
    ).toEqual({ kind: 'include', values: ['checkout', 'billing'] });
  });

  it('clears the owned filter when the query is below minLength', () => {
    expect(buildQueryFilterSpec(model, rows, { dimension: 'service', query: 'pa', minLength: 3 })).toBeNull();
  });

  it('keeps an active empty include filter for a non-empty query with no matches', () => {
    expect(buildQueryFilterSpec(model, rows, { dimension: 'service', fields: ['message'], query: 'missing' })).toEqual({
      kind: 'include',
      values: [],
    });
  });

  it('validates the target dimension and searched fields', () => {
    expect(() => buildQueryFilterSpec(model, rows, { dimension: 'ghost', query: 'payment' })).toThrow(
      /Unknown query dimension: ghost/,
    );
    expect(() =>
      buildQueryFilterSpec(model, rows, { dimension: 'service', fields: ['ghost'], query: 'payment' }),
    ).toThrow(/Unknown query field: ghost/);
  });
});
