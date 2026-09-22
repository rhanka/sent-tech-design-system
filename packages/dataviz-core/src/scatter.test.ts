import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildScatterModel } from './scatter.js';

const model: DataModel = {
  dimensions: [
    { id: 'category', label: 'Catégorie', type: 'discrete' },
  ],
  measures: [
    { id: 'revenue', label: 'Revenu', aggregation: 'sum' },
    { id: 'units', label: 'Unités', aggregation: 'sum' },
  ],
};

const rows: Row[] = [
  { category: 'A', revenue: 100, units: 10 },
  { category: 'B', revenue: 200, units: 20 },
  { category: 'A', revenue: 50, units: 5 },
];

describe('buildScatterModel', () => {
  it('maps two measures as x/y coordinates per row', () => {
    const result = buildScatterModel(model, rows, { x: 'revenue', y: 'units' });
    expect(result.data).toHaveLength(3);
    expect(result.data[0]).toEqual({ x: 100, y: 10 });
    expect(result.data[1]).toEqual({ x: 200, y: 20 });
    expect(result.data[2]).toEqual({ x: 50, y: 5 });
    expect(result.xLabel).toBe('Revenu');
    expect(result.yLabel).toBe('Unités');
  });

  it('skips rows where x or y is not a finite number', () => {
    const sparseRows: Row[] = [
      { revenue: 100, units: 10 },
      { revenue: null, units: 20 },
      { revenue: 50, units: null },
      { revenue: NaN, units: 5 },
    ];
    const result = buildScatterModel(model, sparseRows, { x: 'revenue', y: 'units' });
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toEqual({ x: 100, y: 10 });
  });

  it('assigns tones cycling through category1–8 when series is provided', () => {
    const result = buildScatterModel(model, rows, { x: 'revenue', y: 'units', series: 'category' });
    // A → category1, B → category2, A → category1 (same tone for same value)
    expect(result.data[0]!.tone).toBe('category1');
    expect(result.data[1]!.tone).toBe('category2');
    expect(result.data[2]!.tone).toBe('category1');
  });

  it('assigns label from labelField when provided', () => {
    const result = buildScatterModel(model, rows, { x: 'revenue', y: 'units', labelField: 'category' });
    expect(result.data[0]!.label).toBe('A');
    expect(result.data[1]!.label).toBe('B');
  });
});
