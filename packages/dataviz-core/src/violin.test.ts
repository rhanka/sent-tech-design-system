import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildViolinModel } from './violin.js';

const model: DataModel = {
  dimensions: [
    { id: 'category', label: 'Catégorie', type: 'discrete' },
  ],
  measures: [
    { id: 'price', label: 'Prix', aggregation: 'avg' },
  ],
};

const rows: Row[] = [
  { category: 'A', price: 10 },
  { category: 'A', price: 20 },
  { category: 'A', price: 30 },
  { category: 'B', price: 5 },
  { category: 'B', price: 15 },
  { category: 'C', price: 100 },
];

const config = { groupBy: 'category', measure: 'price' };

describe('buildViolinModel', () => {
  it('groups rows into one datum per group with values collected', () => {
    const result = buildViolinModel(model, rows, config);
    expect(result.data).toHaveLength(3);
    expect(result.data[0]).toMatchObject({ label: 'A', values: [10, 20, 30] });
    expect(result.data[1]).toMatchObject({ label: 'B', values: [5, 15] });
    expect(result.data[2]).toMatchObject({ label: 'C', values: [100] });
  });

  it('cycles tones category1..category8 in first-seen order', () => {
    const result = buildViolinModel(model, rows, config);
    expect(result.data[0]!.tone).toBe('category1');
    expect(result.data[1]!.tone).toBe('category2');
    expect(result.data[2]!.tone).toBe('category3');
  });

  it('drops non-finite measure values but keeps the group', () => {
    const sparseRows: Row[] = [
      { category: 'A', price: 10 },
      { category: 'A', price: null },
      { category: 'A', price: NaN },
      { category: 'B', price: undefined },
    ];
    const result = buildViolinModel(model, sparseRows, config);
    expect(result.data).toHaveLength(2);
    expect(result.data[0]).toMatchObject({ label: 'A', values: [10] });
    // Group B has no finite values — still emitted with empty array.
    expect(result.data[1]).toMatchObject({ label: 'B', values: [] });
  });

  it('passes bins and quartiles through to the model', () => {
    const result = buildViolinModel(model, rows, { ...config, bins: 30, quartiles: false });
    expect(result.bins).toBe(30);
    expect(result.quartiles).toBe(false);
  });
});
