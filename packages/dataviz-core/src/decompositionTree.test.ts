import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildDecompositionTreeData } from './decompositionTree.js';

const model: DataModel = {
  dimensions: [
    { id: 'region', label: 'Région', type: 'discrete' },
    { id: 'category', label: 'Catégorie', type: 'discrete' },
    { id: 'product', label: 'Produit', type: 'discrete' },
  ],
  measures: [{ id: 'revenue', label: 'CA (k€)', aggregation: 'sum' }],
};

const rows: Row[] = [
  { region: 'Nord', category: 'A', product: 'P1', revenue: 10 },
  { region: 'Nord', category: 'A', product: 'P2', revenue: 5 },
  { region: 'Nord', category: 'B', product: 'P1', revenue: 7 },
  { region: 'Sud', category: 'A', product: 'P1', revenue: 3 },
];

describe('buildDecompositionTreeData', () => {
  it('aggregates the measure correctly across levels (sums per group)', () => {
    const result = buildDecompositionTreeData(model, rows, {
      measure: 'revenue',
      levels: ['region', 'category', 'product'],
    });

    expect(result.measure).toBe('revenue');
    expect(result.levels).toHaveLength(3);

    // Level 0: region totals.
    expect(result.levels[0]!.dimension).toBe('region');
    expect(result.levels[0]!.nodes).toEqual([
      { label: 'Nord', value: 22 },
      { label: 'Sud', value: 3 },
    ]);

    // Level 1: region×category totals.
    expect(result.levels[1]!.dimension).toBe('category');
    expect(result.levels[1]!.nodes).toEqual([
      { label: 'A', value: 15, parent: 'Nord' },
      { label: 'B', value: 7, parent: 'Nord' },
      { label: 'A', value: 3, parent: 'Sud' },
    ]);

    // Level 2: region×category×product totals.
    expect(result.levels[2]!.dimension).toBe('product');
    expect(result.levels[2]!.nodes).toEqual([
      { label: 'P1', value: 10, parent: 'A' },
      { label: 'P2', value: 5, parent: 'A' },
      { label: 'P1', value: 7, parent: 'B' },
      { label: 'P1', value: 3, parent: 'A' },
    ]);
  });

  it('omits parent on level-0 nodes and sets immediate parent on deeper nodes', () => {
    const result = buildDecompositionTreeData(model, rows, {
      measure: 'revenue',
      levels: ['region', 'category'],
    });
    for (const node of result.levels[0]!.nodes) {
      expect(node).not.toHaveProperty('parent');
    }
    for (const node of result.levels[1]!.nodes) {
      expect(typeof node.parent).toBe('string');
    }
  });

  it('preserves first-seen ordering of groups', () => {
    const ordered: Row[] = [
      { region: 'Sud', category: 'A', product: 'P1', revenue: 1 },
      { region: 'Nord', category: 'A', product: 'P1', revenue: 1 },
      { region: 'Sud', category: 'B', product: 'P1', revenue: 1 },
    ];
    const result = buildDecompositionTreeData(model, ordered, {
      measure: 'revenue',
      levels: ['region', 'category'],
    });
    expect(result.levels[0]!.nodes.map((n) => n.label)).toEqual(['Sud', 'Nord']);
  });

  it('drops rows where the measure is non-finite', () => {
    const sparseRows: Row[] = [
      { region: 'Nord', category: 'A', product: 'P1', revenue: 10 },
      { region: 'Nord', category: 'A', product: 'P2', revenue: null },
      { region: 'Sud', category: 'B', product: 'P1', revenue: NaN },
      { region: 'Sud', category: 'B', product: 'P2', revenue: undefined },
    ];
    const result = buildDecompositionTreeData(model, sparseRows, {
      measure: 'revenue',
      levels: ['region', 'category'],
    });
    expect(result.levels[0]!.nodes).toEqual([{ label: 'Nord', value: 10 }]);
  });

  it('returns { measure, levels: [] } when levels is empty', () => {
    const result = buildDecompositionTreeData(model, rows, {
      measure: 'revenue',
      levels: [],
    });
    expect(result).toEqual({ measure: 'revenue', levels: [] });
  });
});
