import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildCorrelationMatrix } from './correlation.js';

const model: DataModel = {
  dimensions: [],
  measures: [
    { id: 'price', label: 'Prix', aggregation: 'sum' },
    { id: 'units', label: 'Unités', aggregation: 'sum' },
    { id: 'revenue', label: 'Revenu', aggregation: 'sum' },
    { id: 'cost', label: 'Coût', aggregation: 'sum' },
  ],
};

// price and revenue are perfectly correlated (revenue = price * 2)
// price and cost are perfectly anti-correlated (cost = -price + 100)
const rows: Row[] = [
  { price: 10, units: 5, revenue: 20,  cost: 90 },
  { price: 20, units: 5, revenue: 40,  cost: 80 },
  { price: 30, units: 5, revenue: 60,  cost: 70 },
  { price: 40, units: 5, revenue: 80,  cost: 60 },
  { price: 50, units: 5, revenue: 100, cost: 50 },
];

const config = { measures: ['price', 'units', 'revenue', 'cost'] };

describe('buildCorrelationMatrix', () => {
  it('returns N² entries for N measures', () => {
    const result = buildCorrelationMatrix(model, rows, config);
    expect(result).toHaveLength(16); // 4×4
  });

  it('sets diagonal to exactly 1', () => {
    const result = buildCorrelationMatrix(model, rows, config);
    const diagonal = result.filter((d) => d.x === d.y);
    expect(diagonal).toHaveLength(4);
    for (const d of diagonal) {
      expect(d.value).toBe(1);
    }
  });

  it('returns ≈1 for perfectly correlated pair (price ↔ revenue)', () => {
    const result = buildCorrelationMatrix(model, rows, config);
    const cell = result.find((d) => d.x === 'Prix' && d.y === 'Revenu');
    expect(cell).toBeDefined();
    expect(cell!.value).toBeCloseTo(1, 3);
  });

  it('returns ≈-1 for perfectly anti-correlated pair (price ↔ cost)', () => {
    const result = buildCorrelationMatrix(model, rows, config);
    const cell = result.find((d) => d.x === 'Prix' && d.y === 'Coût');
    expect(cell).toBeDefined();
    expect(cell!.value).toBeCloseTo(-1, 3);
  });

  it('returns 0 for uncorrelated pair (price ↔ units — constant)', () => {
    const result = buildCorrelationMatrix(model, rows, config);
    const cell = result.find((d) => d.x === 'Prix' && d.y === 'Unités');
    expect(cell).toBeDefined();
    // units is constant → std-dev 0 → pearson NaN → mapped to 0
    expect(cell!.value).toBe(0);
  });

  it('uses measure labels as x/y (not field ids)', () => {
    const result = buildCorrelationMatrix(model, rows, { measures: ['price', 'revenue'] });
    expect(result.map((d) => d.x)).toEqual(['Prix', 'Prix', 'Revenu', 'Revenu']);
    expect(result.map((d) => d.y)).toEqual(['Prix', 'Revenu', 'Prix', 'Revenu']);
  });

  it('skips rows where either measure value is non-finite', () => {
    const sparseRows: Row[] = [
      { price: 10, revenue: 20 },
      { price: null, revenue: 40 },
      { price: 30, revenue: NaN },
      { price: 40, revenue: 80 },
    ];
    // Only rows 0 and 3 are finite — still a perfect correlation
    const result = buildCorrelationMatrix(model, sparseRows, { measures: ['price', 'revenue'] });
    const cell = result.find((d) => d.x === 'Prix' && d.y === 'Revenu');
    expect(cell!.value).toBeCloseTo(1, 3);
  });
});
