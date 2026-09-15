import { describe, it, expect } from 'vitest';
import { distinctSorted, buildBubbleFrame } from './animatedBubble.js';
import type { DataModel, Row } from './model.js';

const model: DataModel = {
  dimensions: [
    { id: 'country', label: 'Pays', type: 'discrete' },
    { id: 'year', label: 'Année', type: 'discrete' },
  ],
  measures: [
    { id: 'gdp', label: 'PIB/hab (USD)', aggregation: 'sum' },
    { id: 'life', label: 'Espérance de vie', aggregation: 'sum' },
    { id: 'pop', label: 'Population', aggregation: 'sum' },
  ],
};

const rows: Row[] = [
  { country: 'France',    year: '2000', gdp: 22000, life: 79, pop: 60_000_000 },
  { country: 'Allemagne', year: '2000', gdp: 25000, life: 78, pop: 82_000_000 },
  { country: 'France',    year: '2020', gdp: 40000, life: 82, pop: 67_000_000 },
  { country: 'Allemagne', year: '2020', gdp: 46000, life: 81, pop: 83_000_000 },
];

describe('distinctSorted', () => {
  it('returns sorted numeric strings', () => {
    expect(distinctSorted(rows, 'year')).toEqual(['2000', '2020']);
  });

  it('returns sorted lexicographic strings', () => {
    const result = distinctSorted(rows, 'country');
    expect(result).toEqual(['Allemagne', 'France']);
  });
});

describe('buildBubbleFrame', () => {
  it('produces one datum per row, with r proportional to size', () => {
    const frame2000 = buildBubbleFrame(model, rows.filter((r) => r['year'] === '2000'), {
      x: 'gdp',
      y: 'life',
      size: 'pop',
      series: 'country',
    });
    expect(frame2000.data).toHaveLength(2);
    // Largest pop gets r = 32.
    const radii = frame2000.data.map((d) => d.r);
    expect(Math.max(...radii)).toBeCloseTo(32, 1);
    // Smaller pop gets r < 32.
    expect(Math.min(...radii)).toBeLessThan(32);
  });

  it('assigns distinct tones to distinct series values', () => {
    const frame = buildBubbleFrame(model, rows.filter((r) => r['year'] === '2000'), {
      x: 'gdp',
      y: 'life',
      size: 'pop',
      series: 'country',
    });
    const tones = new Set(frame.data.map((d) => d.tone));
    expect(tones.size).toBe(2);
  });

  it('sets xLabel and yLabel from model', () => {
    const frame = buildBubbleFrame(model, rows.filter((r) => r['year'] === '2000'), {
      x: 'gdp',
      y: 'life',
      size: 'pop',
    });
    expect(frame.xLabel).toBe('PIB/hab (USD)');
    expect(frame.yLabel).toBe('Espérance de vie');
  });

  it('skips rows with non-finite x or y', () => {
    const badRows: Row[] = [...rows.filter((r) => r['year'] === '2000'), { country: 'X', year: '2000', gdp: NaN, life: 79, pop: 1_000_000 }];
    const frame = buildBubbleFrame(model, badRows, { x: 'gdp', y: 'life', size: 'pop' });
    expect(frame.data).toHaveLength(2);
  });
});
