import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildBellCurveData } from './bellCurve.js';

const model: DataModel = {
  dimensions: [],
  measures: [
    { id: 'score', label: 'Score', aggregation: 'avg' },
  ],
};

const rows: Row[] = [
  { score: 45 },
  { score: 60 },
  { score: 72 },
  { score: 55 },
  { score: 80 },
];

const config = { measure: 'score' };

describe('buildBellCurveData', () => {
  it('collects all finite numeric measure values into a flat array', () => {
    const result = buildBellCurveData(model, rows, config);
    expect(result).toHaveLength(5);
    expect(result).toEqual([45, 60, 72, 55, 80]);
  });

  it('drops non-finite measure values', () => {
    const sparseRows: Row[] = [
      { score: 45 },
      { score: null },
      { score: NaN },
      { score: undefined },
      { score: 80 },
    ];
    const result = buildBellCurveData(model, sparseRows, config);
    expect(result).toHaveLength(2);
    expect(result).toEqual([45, 80]);
  });

  it('returns an empty array for empty rows', () => {
    const result = buildBellCurveData(model, [], config);
    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });
});
