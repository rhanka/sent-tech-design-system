import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildColumnPyramidData } from './columnPyramid.js';

const model: DataModel = {
  dimensions: [
    { id: 'stage', label: 'Étape', type: 'discrete' },
  ],
  measures: [
    { id: 'count', label: 'Nombre', aggregation: 'sum' },
  ],
};

const rows: Row[] = [
  { stage: 'Visiteurs', count: 1000 },
  { stage: 'Inscrits', count: 420 },
  { stage: 'Actifs', count: 180 },
];

const config = { category: 'stage', value: 'count' };

describe('buildColumnPyramidData', () => {
  it('maps category and value fields per row with cycling tones', () => {
    const result = buildColumnPyramidData(model, rows, config);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ category: 'Visiteurs', value: 1000, tone: 'category1' });
    expect(result[1]).toEqual({ category: 'Inscrits', value: 420, tone: 'category2' });
    expect(result[2]).toEqual({ category: 'Actifs', value: 180, tone: 'category3' });
  });

  it('drops rows where value is non-finite', () => {
    const sparseRows: Row[] = [
      { stage: 'Visiteurs', count: 1000 },
      { stage: 'Inscrits', count: null },
      { stage: 'Actifs', count: NaN },
      { stage: 'Payants', count: undefined },
    ];
    const result = buildColumnPyramidData(model, sparseRows, config);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ category: 'Visiteurs', value: 1000 });
  });

  it('coerces the category field to string and cycles tones beyond category8', () => {
    const manyRows: Row[] = Array.from({ length: 9 }, (_, i) => ({
      stage: i + 1,
      count: 5,
    }));
    const result = buildColumnPyramidData(model, manyRows, config);
    expect(result[0]!.category).toBe('1');
    expect(result[7]!.tone).toBe('category8');
    expect(result[8]!.tone).toBe('category1');
  });
});
