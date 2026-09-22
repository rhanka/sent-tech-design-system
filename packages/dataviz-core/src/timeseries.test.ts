import { describe, expect, it } from 'vitest';
import { buildTimeSeriesModel, type DataModel, type Row } from './index.js';

const model: DataModel = {
  dimensions: [
    { id: 'ts', label: 'Time', type: 'continuous' },
    { id: 'endpoint', label: 'Endpoint', type: 'discrete' },
  ],
  measures: [
    { id: 'requests', label: 'Requests', aggregation: 'sum' },
  ],
};

const data: Row[] = [
  { ts: Date.UTC(2026, 4, 12), endpoint: 'search', requests: 20 },
  { ts: Date.UTC(2026, 4, 10), endpoint: 'search', requests: 10 },
  { ts: Date.UTC(2026, 4, 10), endpoint: 'auth', requests: 2 },
  { ts: Date.UTC(2026, 4, 12), endpoint: 'auth', requests: 3 },
  { ts: Date.UTC(2026, 4, 11), endpoint: 'search', requests: 15 },
];

describe('buildTimeSeriesModel', () => {
  it('sorts time buckets and aggregates a single measure', () => {
    expect(buildTimeSeriesModel(model, data, { time: 'ts', measure: 'requests' })).toEqual({
      timeId: 'ts',
      measureId: 'requests',
      times: [Date.UTC(2026, 4, 10), Date.UTC(2026, 4, 11), Date.UTC(2026, 4, 12)],
      series: [
        {
          id: 'measure:requests',
          label: 'Requests',
          measureId: 'requests',
          values: [12, 15, 23],
        },
      ],
    });
  });

  it('keeps faceted time series as separate line series with null gaps', () => {
    const modelWithGap = buildTimeSeriesModel(model, data, { time: 'ts', series: 'endpoint', measure: 'requests' });

    expect(modelWithGap.series).toEqual([
      {
        id: 'series:search:requests',
        label: 'search',
        measureId: 'requests',
        seriesKey: 'search',
        seriesLabel: 'search',
        values: [10, 15, 20],
      },
      {
        id: 'series:auth:requests',
        label: 'auth',
        measureId: 'requests',
        seriesKey: 'auth',
        seriesLabel: 'auth',
        values: [2, null, 3],
      },
    ]);
  });

  it('validates time, series and measure fields', () => {
    expect(() => buildTimeSeriesModel(model, data, { time: 'missing', measure: 'requests' })).toThrow(
      /Unknown time series time dimension: missing/,
    );
    expect(() => buildTimeSeriesModel(model, data, { time: 'ts', series: 'missing', measure: 'requests' })).toThrow(
      /Unknown time series series dimension: missing/,
    );
    expect(() => buildTimeSeriesModel(model, data, { time: 'ts', measure: 'missing' })).toThrow(
      /Unknown time series measure: missing/,
    );
  });
});
