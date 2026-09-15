import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildStateTimelineData } from './stateTimeline.js';

const model: DataModel = {
  dimensions: [
    { id: 'service', label: 'Service', type: 'discrete' },
    { id: 'state', label: 'État', type: 'discrete' },
  ],
  measures: [
    { id: 'start', label: 'Début (h)', aggregation: 'min' },
    { id: 'end', label: 'Fin (h)', aggregation: 'max' },
  ],
};

const rows: Row[] = [
  { service: 'API',      start: 0,  end: 4,  state: 'up'       },
  { service: 'API',      start: 4,  end: 6,  state: 'degraded' },
  { service: 'API',      start: 6,  end: 24, state: 'up'       },
  { service: 'Database', start: 0,  end: 8,  state: 'up'       },
  { service: 'Database', start: 8,  end: 10, state: 'down'     },
  { service: 'Database', start: 10, end: 24, state: 'up'       },
];

const config = { series: 'service', start: 'start', end: 'end', state: 'state' };

describe('buildStateTimelineData', () => {
  it('groups rows by series into two lanes', () => {
    const result = buildStateTimelineData(model, rows, config);
    expect(result).toHaveLength(2);
    expect(result[0]!.series).toBe('API');
    expect(result[1]!.series).toBe('Database');
  });

  it('maps segments correctly within each series', () => {
    const result = buildStateTimelineData(model, rows, config);
    const api = result[0]!;
    expect(api.segments).toHaveLength(3);
    expect(api.segments[0]).toEqual({ start: 0, end: 4, state: 'up' });
    expect(api.segments[1]).toEqual({ start: 4, end: 6, state: 'degraded' });
    expect(api.segments[2]).toEqual({ start: 6, end: 24, state: 'up' });
  });

  it('drops rows where start or end is non-finite', () => {
    const sparseRows: Row[] = [
      { service: 'API', start: 0,    end: 4,   state: 'up'   },
      { service: 'API', start: null, end: 8,   state: 'down' },
      { service: 'API', start: 8,    end: NaN, state: 'up'   },
    ];
    const result = buildStateTimelineData(model, sparseRows, config);
    expect(result).toHaveLength(1);
    expect(result[0]!.segments).toHaveLength(1);
    expect(result[0]!.segments[0]!.state).toBe('up');
  });

  it('sorts segments by ascending start within a series', () => {
    const unorderedRows: Row[] = [
      { service: 'API', start: 10, end: 20, state: 'down' },
      { service: 'API', start: 0,  end: 10, state: 'up'   },
    ];
    const result = buildStateTimelineData(model, unorderedRows, config);
    const segs = result[0]!.segments;
    expect(segs[0]!.start).toBe(0);
    expect(segs[1]!.start).toBe(10);
  });

  it('coerces state field to string', () => {
    const numericStateRows: Row[] = [{ service: 'API', start: 0, end: 4, state: 1 }];
    const result = buildStateTimelineData(model, numericStateRows, config);
    expect(result[0]!.segments[0]!.state).toBe('1');
  });
});
