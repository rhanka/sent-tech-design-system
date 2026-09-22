import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildVariablePieData } from './variablePie.js';

const model: DataModel = {
  dimensions: [
    { id: 'segment', label: 'Segment', type: 'discrete' },
  ],
  measures: [
    { id: 'revenue', label: 'Revenu', aggregation: 'sum' },
    { id: 'marketShare', label: 'Part de marché', aggregation: 'avg' },
  ],
};

const rows: Row[] = [
  { segment: 'Retail', revenue: 500, marketShare: 30 },
  { segment: 'B2B', revenue: 800, marketShare: 50 },
  { segment: 'Online', revenue: 300, marketShare: 20 },
];

const config = { label: 'segment', value: 'revenue', z: 'marketShare' };

describe('buildVariablePieData', () => {
  it('maps label, value and z fields per row with cycling tones', () => {
    const result = buildVariablePieData(model, rows, config);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ label: 'Retail', value: 500, z: 30, tone: 'category1' });
    expect(result[1]).toEqual({ label: 'B2B', value: 800, z: 50, tone: 'category2' });
    expect(result[2]).toEqual({ label: 'Online', value: 300, z: 20, tone: 'category3' });
  });

  it('drops rows where value or z is non-finite', () => {
    const sparseRows: Row[] = [
      { segment: 'Retail', revenue: 500, marketShare: 30 },
      { segment: 'B2B', revenue: null, marketShare: 50 },
      { segment: 'Online', revenue: 300, marketShare: NaN },
      { segment: 'Export', revenue: undefined, marketShare: undefined },
    ];
    const result = buildVariablePieData(model, sparseRows, config);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ label: 'Retail', value: 500, z: 30 });
  });

  it('coerces the label field to string and cycles tones beyond category8', () => {
    const manyRows: Row[] = Array.from({ length: 9 }, (_, i) => ({
      segment: i + 1,
      revenue: 100,
      marketShare: 10,
    }));
    const result = buildVariablePieData(model, manyRows, config);
    expect(result[0]!.label).toBe('1');
    expect(result[7]!.tone).toBe('category8');
    expect(result[8]!.tone).toBe('category1');
  });
});
