import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildItemChartData } from './itemChart.js';

const model: DataModel = {
  dimensions: [
    { id: 'category', label: 'Catégorie', type: 'discrete' },
  ],
  measures: [
    { id: 'count', label: 'Nombre', aggregation: 'count' },
  ],
};

const rows: Row[] = [
  { category: 'Bronze', count: 3 },
  { category: 'Silver', count: 7 },
  { category: 'Gold', count: 12 },
];

const config = { label: 'category', value: 'count' };

describe('buildItemChartData', () => {
  it('maps label and value fields per row with cycling tones', () => {
    const result = buildItemChartData(model, rows, config);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ label: 'Bronze', value: 3, tone: 'category1' });
    expect(result[1]).toEqual({ label: 'Silver', value: 7, tone: 'category2' });
    expect(result[2]).toEqual({ label: 'Gold', value: 12, tone: 'category3' });
  });

  it('drops rows where value is non-finite', () => {
    const sparseRows: Row[] = [
      { category: 'Bronze', count: 3 },
      { category: 'Silver', count: null },
      { category: 'Gold', count: NaN },
      { category: 'Platinum', count: undefined },
    ];
    const result = buildItemChartData(model, sparseRows, config);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ label: 'Bronze', value: 3 });
  });

  it('coerces the label field to string and cycles tones beyond category8', () => {
    const manyRows: Row[] = Array.from({ length: 9 }, (_, i) => ({
      category: i + 1,
      count: 5,
    }));
    const result = buildItemChartData(model, manyRows, config);
    expect(result[0]!.label).toBe('1');
    expect(result[7]!.tone).toBe('category8');
    expect(result[8]!.tone).toBe('category1');
  });
});
