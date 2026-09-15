import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildRibbonData } from './ribbon.js';

const model: DataModel = {
  dimensions: [
    { id: 'product', label: 'Produit', type: 'discrete' },
    { id: 'quarter', label: 'Trimestre', type: 'discrete' },
  ],
  measures: [
    { id: 'sales', label: 'Ventes', aggregation: 'sum' },
  ],
};

const rows: Row[] = [
  { product: 'Alpha', quarter: 'Q1', sales: 120 },
  { product: 'Beta',  quarter: 'Q1', sales: 95 },
  { product: 'Alpha', quarter: 'Q2', sales: 135 },
  { product: 'Beta',  quarter: 'Q2', sales: 110 },
];

const config = { category: 'product', period: 'quarter', value: 'sales' };

describe('buildRibbonData', () => {
  it('maps category, period and value fields per row', () => {
    const result = buildRibbonData(model, rows, config);
    expect(result).toHaveLength(4);
    expect(result[0]).toEqual({ category: 'Alpha', period: 'Q1', value: 120, tone: 'category1' });
    expect(result[1]).toEqual({ category: 'Beta',  period: 'Q1', value: 95,  tone: 'category2' });
    expect(result[2]).toEqual({ category: 'Alpha', period: 'Q2', value: 135, tone: 'category1' });
    expect(result[3]).toEqual({ category: 'Beta',  period: 'Q2', value: 110, tone: 'category2' });
  });

  it('assigns stable tones across periods for the same category', () => {
    const result = buildRibbonData(model, rows, config);
    const alphaRows = result.filter((d) => d.category === 'Alpha');
    expect(alphaRows.every((d) => d.tone === 'category1')).toBe(true);
    const betaRows = result.filter((d) => d.category === 'Beta');
    expect(betaRows.every((d) => d.tone === 'category2')).toBe(true);
  });

  it('drops rows where value is non-finite', () => {
    const sparseRows: Row[] = [
      { product: 'Alpha', quarter: 'Q1', sales: 120 },
      { product: 'Beta',  quarter: 'Q1', sales: null },
      { product: 'Gamma', quarter: 'Q1', sales: NaN },
      { product: 'Delta', quarter: 'Q1', sales: undefined },
    ];
    const result = buildRibbonData(model, sparseRows, config);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ category: 'Alpha', value: 120 });
  });

  it('preserves numeric period type', () => {
    const numericRows: Row[] = [
      { product: 'Alpha', quarter: 2024, sales: 100 },
      { product: 'Beta',  quarter: 2025, sales: 200 },
    ];
    const result = buildRibbonData(model, numericRows, config);
    expect(typeof result[0]!.period).toBe('number');
    expect(result[0]!.period).toBe(2024);
  });

  it('coerces category to string and cycles tones beyond category8', () => {
    const manyRows: Row[] = Array.from({ length: 9 }, (_, i) => ({
      product: i + 1,
      quarter: 'Q1',
      sales: 10,
    }));
    const result = buildRibbonData(model, manyRows, config);
    expect(result[0]!.category).toBe('1');
    expect(result[7]!.tone).toBe('category8');
    expect(result[8]!.tone).toBe('category1');
  });
});
