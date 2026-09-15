import { describe, expect, it } from 'vitest';
import { buildDateHistogramModel, type DataModel, type Row } from './index.js';

const DAY = 24 * 60 * 60 * 1000;

const model: DataModel = {
  dimensions: [{ id: 'ts', label: 'Timestamp', type: 'continuous' }],
  measures: [{ id: 'count', label: 'Count', aggregation: 'sum' }],
};

const rows: Row[] = [
  { ts: Date.UTC(2026, 0, 1, 1), count: 1 },
  { ts: Date.UTC(2026, 0, 1, 8), count: 1 },
  { ts: Date.UTC(2026, 0, 2, 3), count: 1 },
  { ts: Date.UTC(2026, 0, 4, 7), count: 1 },
];

describe('buildDateHistogramModel', () => {
  it('builds calendar-aligned day buckets including empty buckets', () => {
    const start = Date.UTC(2026, 0, 1);
    expect(buildDateHistogramModel(model, rows, { date: 'ts', interval: 'day' })).toEqual({
      dateId: 'ts',
      domain: [start, start + 4 * DAY],
      bins: [
        { index: 0, start, end: start + DAY, count: 2 },
        { index: 1, start: start + DAY, end: start + 2 * DAY, count: 1 },
        { index: 2, start: start + 2 * DAY, end: start + 3 * DAY, count: 0 },
        { index: 3, start: start + 3 * DAY, end: start + 4 * DAY, count: 1 },
      ],
    });
  });

  it('builds fixed-count buckets when no calendar interval is requested', () => {
    const model = buildDateHistogramModel(
      { dimensions: [{ id: 'ts', label: 'Timestamp', type: 'continuous' }], measures: [] },
      [
        { ts: 0 },
        { ts: 25 },
        { ts: 75 },
        { ts: 100 },
      ],
      { date: 'ts', bins: 4, domain: [0, 100] },
    );

    expect(model.bins.map((bin) => bin.count)).toEqual([1, 1, 0, 2]);
    expect(model.domain).toEqual([0, 100]);
  });

  it('honours the raw domain when counting inside calendar-aligned buckets', () => {
    const start = Date.UTC(2026, 0, 1);
    const model = buildDateHistogramModel(
      { dimensions: [{ id: 'ts', label: 'Timestamp', type: 'continuous' }], measures: [] },
      [
        { ts: start + 60_000 },
        { ts: start + 12 * 60 * 60 * 1000 },
        { ts: start + 23 * 60 * 60 * 1000 },
      ],
      {
        date: 'ts',
        interval: 'day',
        domain: [start + 11 * 60 * 60 * 1000, start + 13 * 60 * 60 * 1000],
      },
    );

    expect(model.domain).toEqual([start, start + DAY]);
    expect(model.bins.map((bin) => bin.count)).toEqual([1]);
  });

  it('validates the date dimension and positive bins', () => {
    expect(() => buildDateHistogramModel(model, rows, { date: 'ghost' })).toThrow(
      /Unknown date histogram dimension: ghost/,
    );
    expect(() => buildDateHistogramModel(model, rows, { date: 'ts', bins: 0 })).toThrow(
      /Date histogram bins must be a positive integer/,
    );
  });
});
