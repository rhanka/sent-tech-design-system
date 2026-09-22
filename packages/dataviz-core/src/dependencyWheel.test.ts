import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildDependencyWheelData } from './dependencyWheel.js';

const model: DataModel = {
  dimensions: [
    { id: 'source', label: 'Source', type: 'discrete' },
    { id: 'target', label: 'Cible', type: 'discrete' },
  ],
  measures: [
    { id: 'weight', label: 'Poids', aggregation: 'sum' },
  ],
};

const rows: Row[] = [
  { source: 'Alpha', target: 'Beta', weight: 5 },
  { source: 'Beta', target: 'Gamma', weight: 3 },
  { source: 'Alpha', target: 'Delta', weight: 8 },
];

const config = { source: 'source', target: 'target', weight: 'weight' };

describe('buildDependencyWheelData', () => {
  it('maps source, target and weight fields per row', () => {
    const result = buildDependencyWheelData(model, rows, config);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ from: 'Alpha', to: 'Beta', weight: 5 });
    expect(result[1]).toEqual({ from: 'Beta', to: 'Gamma', weight: 3 });
    expect(result[2]).toEqual({ from: 'Alpha', to: 'Delta', weight: 8 });
  });

  it('skips rows where weight is non-finite', () => {
    const sparseRows: Row[] = [
      { source: 'Alpha', target: 'Beta', weight: 5 },
      { source: 'Beta', target: 'Gamma', weight: NaN },
      { source: 'Alpha', target: 'Delta', weight: Infinity },
      { source: 'Delta', target: 'Epsilon', weight: null },
      { source: 'Gamma', target: 'Alpha', weight: undefined },
    ];
    const result = buildDependencyWheelData(model, sparseRows, config);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ from: 'Alpha', to: 'Beta', weight: 5 });
  });

  it('skips rows where weight is zero or negative', () => {
    const negativeRows: Row[] = [
      { source: 'Alpha', target: 'Beta', weight: 0 },
      { source: 'Beta', target: 'Gamma', weight: -1 },
      { source: 'Alpha', target: 'Delta', weight: 4 },
    ];
    const result = buildDependencyWheelData(model, negativeRows, config);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ from: 'Alpha', to: 'Delta', weight: 4 });
  });

  it('coerces source and target fields to strings', () => {
    const numericRows: Row[] = [
      { source: 1, target: 2, weight: 7 },
    ];
    const result = buildDependencyWheelData(model, numericRows, config);
    expect(result[0]!.from).toBe('1');
    expect(result[0]!.to).toBe('2');
  });

  it('coerces string weight values to numbers', () => {
    const stringWeightRows: Row[] = [
      { source: 'Alpha', target: 'Beta', weight: '6' },
    ];
    const result = buildDependencyWheelData(model, stringWeightRows, config);
    expect(result).toHaveLength(1);
    expect(result[0]!.weight).toBe(6);
  });

  it('returns empty array for empty rows', () => {
    const result = buildDependencyWheelData(model, [], config);
    expect(result).toHaveLength(0);
  });
});
