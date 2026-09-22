import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildTraceWaterfallData } from './traceWaterfall.js';

const model: DataModel = {
  dimensions: [
    { id: 'spanId', label: 'Span', type: 'discrete' },
    { id: 'parentSpanId', label: 'Parent', type: 'discrete' },
    { id: 'service', label: 'Service', type: 'discrete' },
  ],
  measures: [
    { id: 'start', label: 'Début (ms)', aggregation: 'sum' },
    { id: 'duration', label: 'Durée (ms)', aggregation: 'sum' },
  ],
};

const config = {
  spanId: 'spanId',
  parentSpanId: 'parentSpanId',
  service: 'service',
  start: 'start',
  duration: 'duration',
};

const rows: Row[] = [
  { spanId: 's0', parentSpanId: '', service: 'api-gateway', start: 0, duration: 200 },
  { spanId: 's1', parentSpanId: 's0', service: 'auth-service', start: 10, duration: 40 },
  { spanId: 's2', parentSpanId: 's0', service: 'user-service', start: 55, duration: 90 },
];

describe('buildTraceWaterfallData', () => {
  it('maps span fields per row and returns { spans }', () => {
    const result = buildTraceWaterfallData(model, rows, config);
    expect(result.spans).toHaveLength(3);
    expect(result.spans[0]).toEqual({
      spanId: 's0',
      parentSpanId: null,
      service: 'api-gateway',
      start: 0,
      duration: 200,
    });
    expect(result.spans[1]).toEqual({
      spanId: 's1',
      parentSpanId: 's0',
      service: 'auth-service',
      start: 10,
      duration: 40,
    });
  });

  it('normalises empty or null parentSpanId to null (roots)', () => {
    const rootRows: Row[] = [
      { spanId: 'a', parentSpanId: '', service: 'svc', start: 0, duration: 10 },
      { spanId: 'b', parentSpanId: null, service: 'svc', start: 5, duration: 10 },
      { spanId: 'c', parentSpanId: 'a', service: 'svc', start: 1, duration: 3 },
    ];
    const result = buildTraceWaterfallData(model, rootRows, config);
    expect(result.spans[0]!.parentSpanId).toBeNull();
    expect(result.spans[1]!.parentSpanId).toBeNull();
    expect(result.spans[2]!.parentSpanId).toBe('a');
  });

  it('drops rows where start or duration is non-finite', () => {
    const sparseRows: Row[] = [
      { spanId: 's0', parentSpanId: '', service: 'api-gateway', start: 0, duration: 200 },
      { spanId: 's1', parentSpanId: 's0', service: 'auth-service', start: null, duration: 40 },
      { spanId: 's2', parentSpanId: 's0', service: 'user-service', start: 55, duration: NaN },
      { spanId: 's3', parentSpanId: 's0', service: 'db', start: undefined, duration: undefined },
    ];
    const result = buildTraceWaterfallData(model, sparseRows, config);
    expect(result.spans).toHaveLength(1);
    expect(result.spans[0]).toMatchObject({ spanId: 's0', service: 'api-gateway' });
  });

  it('coerces spanId and service to string', () => {
    const numericRows: Row[] = [
      { spanId: 42, parentSpanId: '', service: 7, start: 0, duration: 5 },
    ];
    const result = buildTraceWaterfallData(model, numericRows, config);
    expect(result.spans[0]!.spanId).toBe('42');
    expect(result.spans[0]!.service).toBe('7');
  });

  it('parses numeric strings for start and duration', () => {
    const stringRows: Row[] = [
      { spanId: 's0', parentSpanId: '', service: 'svc', start: '12', duration: '8' },
    ];
    const result = buildTraceWaterfallData(model, stringRows, config);
    expect(result.spans[0]!.start).toBe(12);
    expect(result.spans[0]!.duration).toBe(8);
  });

  it('returns { spans: [] } for empty rows', () => {
    const result = buildTraceWaterfallData(model, [], config);
    expect(result).toEqual({ spans: [] });
  });
});
