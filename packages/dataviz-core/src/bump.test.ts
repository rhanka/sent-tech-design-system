import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildBumpModel } from './bump.js';

const model: DataModel = {
  dimensions: [
    { id: 'team', label: 'Équipe', type: 'discrete' },
    { id: 'month', label: 'Mois', type: 'discrete' },
  ],
  measures: [
    { id: 'score', label: 'Score', aggregation: 'sum' },
  ],
};

const rows: Row[] = [
  // Jan: A=100, B=80, C=60 → ranks A=1, B=2, C=3
  { team: 'A', month: 'Jan', score: 100 },
  { team: 'B', month: 'Jan', score: 80 },
  { team: 'C', month: 'Jan', score: 60 },
  // Feb: B=120, A=90, C=50 → ranks B=1, A=2, C=3
  { team: 'B', month: 'Feb', score: 120 },
  { team: 'A', month: 'Feb', score: 90 },
  { team: 'C', month: 'Feb', score: 50 },
];

const config = { series: 'team', category: 'month', measure: 'score' };

describe('buildBumpModel', () => {
  it('builds categories in first-seen order', () => {
    const result = buildBumpModel(model, rows, config);
    expect(result.categories).toEqual(['Jan', 'Feb']);
  });

  it('ranks series correctly (desc default: rank 1 = highest)', () => {
    const result = buildBumpModel(model, rows, config);
    const teamA = result.series.find((s) => s.label === 'A')!;
    const teamB = result.series.find((s) => s.label === 'B')!;
    const teamC = result.series.find((s) => s.label === 'C')!;
    // Jan ranks
    expect(teamA.ranks[0]).toBe(1);
    expect(teamB.ranks[0]).toBe(2);
    expect(teamC.ranks[0]).toBe(3);
    // Feb ranks
    expect(teamB.ranks[1]).toBe(1);
    expect(teamA.ranks[1]).toBe(2);
    expect(teamC.ranks[1]).toBe(3);
  });

  it('emits null rank for missing series/category combos', () => {
    const sparseRows: Row[] = [
      { team: 'A', month: 'Jan', score: 100 },
      { team: 'B', month: 'Feb', score: 80 },
      // A absent in Feb, B absent in Jan
    ];
    const result = buildBumpModel(model, sparseRows, config);
    const teamA = result.series.find((s) => s.label === 'A')!;
    const teamB = result.series.find((s) => s.label === 'B')!;
    expect(teamA.ranks[1]).toBeNull(); // A has no Feb data
    expect(teamB.ranks[0]).toBeNull(); // B has no Jan data
  });

  it('cycles tones in first-seen series order', () => {
    const result = buildBumpModel(model, rows, config);
    // Series first-seen order: A, B, C
    expect(result.series[0]!.tone).toBe('category1');
    expect(result.series[1]!.tone).toBe('category2');
    expect(result.series[2]!.tone).toBe('category3');
  });

  it('supports asc direction (rank 1 = lowest)', () => {
    const result = buildBumpModel(model, rows, { ...config, direction: 'asc' });
    const teamA = result.series.find((s) => s.label === 'A')!;
    const teamC = result.series.find((s) => s.label === 'C')!;
    // Jan: C=60 is lowest → rank 1
    expect(teamC.ranks[0]).toBe(1);
    // A=100 is highest → rank 3
    expect(teamA.ranks[0]).toBe(3);
  });
});
