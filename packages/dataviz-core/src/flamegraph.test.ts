import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildFlamegraphData } from './flamegraph.js';

const model: DataModel = {
  dimensions: [
    { id: 'id', label: 'Id', type: 'discrete' },
    { id: 'parent', label: 'Parent', type: 'discrete' },
    { id: 'name', label: 'Nom', type: 'discrete' },
  ],
  measures: [
    { id: 'value', label: 'Temps CPU (ms)', aggregation: 'sum' },
  ],
};

const config = { id: 'id', parentId: 'parent', name: 'name', value: 'value' };

describe('buildFlamegraphData', () => {
  it('nests children under a single root', () => {
    const rows: Row[] = [
      { id: 'root', parent: '', name: 'request', value: 5 },
      { id: 'a', parent: 'root', name: 'router', value: 10 },
      { id: 'b', parent: 'root', name: 'middleware', value: 20 },
      { id: 'c', parent: 'a', name: 'handler', value: 30 },
    ];
    const result = buildFlamegraphData(model, rows, config);
    expect(result.name).toBe('request');
    expect(result.value).toBe(5);
    expect(result.children).toHaveLength(2);
    expect(result.children![0]!.name).toBe('router');
    expect(result.children![1]!.name).toBe('middleware');
    expect(result.children![0]!.children).toHaveLength(1);
    expect(result.children![0]!.children![0]).toEqual({ name: 'handler', value: 30 });
  });

  it('leaf nodes omit the children key', () => {
    const rows: Row[] = [
      { id: 'root', parent: '', name: 'request', value: 5 },
      { id: 'a', parent: 'root', name: 'router', value: 10 },
    ];
    const result = buildFlamegraphData(model, rows, config);
    const leaf = result.children![0]!;
    expect(leaf).toEqual({ name: 'router', value: 10 });
    expect('children' in leaf).toBe(false);
  });

  it('synthesizes a root wrapper with summed value for multiple roots', () => {
    const rows: Row[] = [
      { id: 'r1', parent: '', name: 'first', value: 10 },
      { id: 'r2', parent: '', name: 'second', value: 30 },
      { id: 'c', parent: 'r1', name: 'child', value: 5 },
    ];
    const result = buildFlamegraphData(model, rows, config);
    expect(result.name).toBe('root');
    expect(result.value).toBe(40);
    expect(result.children).toHaveLength(2);
    expect(result.children!.map((n) => n.name)).toEqual(['first', 'second']);
  });

  it('treats rows with an unknown parent id as roots', () => {
    const rows: Row[] = [
      { id: 'a', parent: 'ghost', name: 'orphan-a', value: 1 },
      { id: 'b', parent: 'ghost', name: 'orphan-b', value: 2 },
    ];
    const result = buildFlamegraphData(model, rows, config);
    expect(result.name).toBe('root');
    expect(result.value).toBe(3);
    expect(result.children).toHaveLength(2);
  });

  it('returns a default root for empty rows', () => {
    const result = buildFlamegraphData(model, [], config);
    expect(result).toEqual({ name: 'root', value: 0 });
  });

  it('coerces a non-finite value to 0', () => {
    const rows: Row[] = [
      { id: 'root', parent: '', name: 'request', value: null },
      { id: 'a', parent: 'root', name: 'router', value: NaN },
    ];
    const result = buildFlamegraphData(model, rows, config);
    expect(result.value).toBe(0);
    expect(result.children![0]).toEqual({ name: 'router', value: 0 });
  });

  it('respects a custom rootLabel for synthesized wrappers', () => {
    const empty = buildFlamegraphData(model, [], { ...config, rootLabel: 'Programme' });
    expect(empty.name).toBe('Programme');

    const multi: Row[] = [
      { id: 'r1', parent: '', name: 'first', value: 10 },
      { id: 'r2', parent: '', name: 'second', value: 20 },
    ];
    const result = buildFlamegraphData(model, multi, { ...config, rootLabel: 'Programme' });
    expect(result.name).toBe('Programme');
    expect(result.value).toBe(30);
  });

  it('skips a self-link so a node never nests under itself', () => {
    const rows: Row[] = [
      { id: 'a', parent: 'a', name: 'loop', value: 7 },
    ];
    const result = buildFlamegraphData(model, rows, config);
    expect(result).toEqual({ name: 'loop', value: 7 });
  });
});
