import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildParallelCoordinatesModel } from './parallelCoordinates.js';

const model: DataModel = {
  dimensions: [
    { id: 'segment', label: 'Segment', type: 'discrete' },
  ],
  measures: [
    { id: 'revenue', label: 'Revenu', aggregation: 'sum' },
    { id: 'units', label: 'Unités', aggregation: 'sum' },
    { id: 'margin', label: 'Marge', aggregation: 'sum' },
  ],
};

const rows: Row[] = [
  { segment: 'SMB', revenue: 100, units: 10, margin: 20 },
  { segment: 'SMB', revenue: 200, units: 20, margin: 40 },
  { segment: 'ENT', revenue: 500, units: 5, margin: 150 },
];

const config = { measures: ['revenue', 'units', 'margin'] };

describe('buildParallelCoordinatesModel', () => {
  it('builds axes from model measure labels', () => {
    const result = buildParallelCoordinatesModel(model, rows, config);
    expect(result.axes).toHaveLength(3);
    expect(result.axes[0]).toEqual({ key: 'revenue', label: 'Revenu' });
    expect(result.axes[1]).toEqual({ key: 'units', label: 'Unités' });
    expect(result.axes[2]).toEqual({ key: 'margin', label: 'Marge' });
  });

  it('maps each row to a record with finite-coerced values', () => {
    const result = buildParallelCoordinatesModel(model, rows, config);
    expect(result.data).toHaveLength(3);
    expect(result.data[0]).toEqual({ revenue: 100, units: 10, margin: 20 });
    expect(result.data[2]).toEqual({ revenue: 500, units: 5, margin: 150 });
  });

  it('omits non-finite values from a row record', () => {
    const sparseRows: Row[] = [
      { revenue: 100, units: NaN, margin: null },
    ];
    const result = buildParallelCoordinatesModel(model, sparseRows, config);
    expect(result.data[0]).toEqual({ revenue: 100 });
    expect(result.data[0]).not.toHaveProperty('units');
    expect(result.data[0]).not.toHaveProperty('margin');
  });

  it('emits tones when a series dimension is provided', () => {
    const result = buildParallelCoordinatesModel(model, rows, {
      ...config,
      series: 'segment',
    });
    expect(result.tones).toBeDefined();
    expect(result.tones).toHaveLength(3);
    // First two rows are SMB → same tone; third row is ENT → different tone
    expect(result.tones![0]).toBe('category1');
    expect(result.tones![1]).toBe('category1');
    expect(result.tones![2]).toBe('category2');
  });

  it('returns no tones property when no series is configured', () => {
    const result = buildParallelCoordinatesModel(model, rows, config);
    expect(result.tones).toBeUndefined();
  });
});
