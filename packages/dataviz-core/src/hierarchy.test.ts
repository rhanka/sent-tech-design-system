import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildHierarchyData } from './hierarchy.js';

const model: DataModel = {
  dimensions: [
    { id: 'id', label: 'ID', type: 'discrete' },
    { id: 'parentId', label: 'Parent ID', type: 'discrete' },
    { id: 'name', label: 'Nom', type: 'discrete' },
  ],
  measures: [],
};

const rows: Row[] = [
  { id: 'ceo', parentId: null, name: 'Alice' },
  { id: 'cto', parentId: 'ceo', name: 'Bob' },
  { id: 'cfo', parentId: 'ceo', name: 'Carol' },
  { id: 'dev', parentId: 'cto', name: 'Dave' },
];

const config = { id: 'id', parentId: 'parentId', label: 'name' };

describe('buildHierarchyData', () => {
  it('maps each row to a hierarchy node with id, parentId and label', () => {
    const result = buildHierarchyData(model, rows, config);
    expect(result).toHaveLength(4);
    expect(result[0]).toMatchObject({ id: 'ceo', parentId: null, label: 'Alice' });
    expect(result[1]).toMatchObject({ id: 'cto', parentId: 'ceo', label: 'Bob' });
    expect(result[2]).toMatchObject({ id: 'cfo', parentId: 'ceo', label: 'Carol' });
    expect(result[3]).toMatchObject({ id: 'dev', parentId: 'cto', label: 'Dave' });
  });

  it('normalises null, undefined and empty-string parentId to null (root)', () => {
    const rootRows: Row[] = [
      { id: 'a', parentId: null, name: 'Root A' },
      { id: 'b', parentId: undefined, name: 'Root B' },
      { id: 'c', parentId: '', name: 'Root C' },
      { id: 'd', parentId: 'a', name: 'Child D' },
    ];
    const result = buildHierarchyData(model, rootRows, config);
    expect(result[0]!.parentId).toBeNull();
    expect(result[1]!.parentId).toBeNull();
    expect(result[2]!.parentId).toBeNull();
    expect(result[3]!.parentId).toBe('a');
  });

  it('string-coerces id and label fields and assigns cycling tones', () => {
    const numericRows: Row[] = [
      { id: 1, parentId: null, name: 100 },
      { id: 2, parentId: 1, name: 200 },
    ];
    const result = buildHierarchyData(model, numericRows, config);
    expect(result[0]!.id).toBe('1');
    expect(result[0]!.label).toBe('100');
    expect(result[0]!.tone).toBe('category1');
    expect(result[1]!.id).toBe('2');
    expect(result[1]!.parentId).toBe('1');
    expect(result[1]!.tone).toBe('category2');
  });
});
