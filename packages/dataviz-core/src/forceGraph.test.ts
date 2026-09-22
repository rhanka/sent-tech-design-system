import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildForceGraphData } from './forceGraph.js';

const model: DataModel = {
  dimensions: [
    { id: 'source', label: 'Source', type: 'discrete' },
    { id: 'target', label: 'Target', type: 'discrete' },
  ],
  measures: [
    { id: 'weight', label: 'Weight', aggregation: 'sum' },
  ],
};

const rows: Row[] = [
  { source: 'api-gateway', target: 'auth-service', weight: 5 },
  { source: 'api-gateway', target: 'user-service', weight: 3 },
  { source: 'auth-service', target: 'db-service', weight: 8 },
  { source: 'user-service', target: 'db-service', weight: 4 },
];

const config = { source: 'source', target: 'target', weight: 'weight' };

describe('buildForceGraphData', () => {
  it('deduplicates nodes from source and target fields', () => {
    const result = buildForceGraphData(model, rows, config);
    // 4 distinct nodes: api-gateway, auth-service, user-service, db-service
    expect(result.nodes).toHaveLength(4);
    const ids = result.nodes.map((n) => n.id);
    expect(ids).toContain('api-gateway');
    expect(ids).toContain('auth-service');
    expect(ids).toContain('user-service');
    expect(ids).toContain('db-service');
  });

  it('sets label equal to id on deduced nodes', () => {
    const result = buildForceGraphData(model, rows, config);
    for (const node of result.nodes) {
      expect(node.label).toBe(node.id);
    }
  });

  it('assigns cycling tones in first-seen order', () => {
    const result = buildForceGraphData(model, rows, config);
    // First seen: api-gateway (category1), auth-service (category2),
    // user-service (category3), db-service (category4)
    const nodeById = Object.fromEntries(result.nodes.map((n) => [n.id, n]));
    expect(nodeById['api-gateway']?.tone).toBe('category1');
    expect(nodeById['auth-service']?.tone).toBe('category2');
    expect(nodeById['user-service']?.tone).toBe('category3');
    expect(nodeById['db-service']?.tone).toBe('category4');
  });

  it('produces one edge per row', () => {
    const result = buildForceGraphData(model, rows, config);
    expect(result.edges).toHaveLength(4);
    expect(result.edges[0]).toEqual({ source: 'api-gateway', target: 'auth-service', width: 5 });
    expect(result.edges[1]).toEqual({ source: 'api-gateway', target: 'user-service', width: 3 });
    expect(result.edges[2]).toEqual({ source: 'auth-service', target: 'db-service', width: 8 });
    expect(result.edges[3]).toEqual({ source: 'user-service', target: 'db-service', width: 4 });
  });

  it('accumulates weight on incident nodes', () => {
    const result = buildForceGraphData(model, rows, config);
    const nodeById = Object.fromEntries(result.nodes.map((n) => [n.id, n]));
    // api-gateway: 5 + 3 = 8
    expect(nodeById['api-gateway']?.weight).toBe(8);
    // auth-service: 5 + 8 = 13
    expect(nodeById['auth-service']?.weight).toBe(13);
    // db-service: 8 + 4 = 12
    expect(nodeById['db-service']?.weight).toBe(12);
  });

  it('works without a weight field (no width/weight on output)', () => {
    const result = buildForceGraphData(model, rows, { source: 'source', target: 'target' });
    for (const edge of result.edges) {
      expect(edge.width).toBeUndefined();
    }
    for (const node of result.nodes) {
      expect(node.weight).toBeUndefined();
    }
  });

  it('drops rows where source or target is null/empty', () => {
    const sparseRows: Row[] = [
      { source: 'a', target: 'b', weight: 1 },
      { source: null, target: 'b', weight: 2 },
      { source: 'a', target: null, weight: 3 },
      { source: '', target: 'c', weight: 4 },
      { source: 'a', target: 'c', weight: 5 },
    ];
    const result = buildForceGraphData(model, sparseRows, config);
    expect(result.edges).toHaveLength(2);
    expect(result.nodes).toHaveLength(3); // a, b, c
  });

  it('drops edges where weight is non-finite but still creates the edge without width', () => {
    const nanRows: Row[] = [
      { source: 'x', target: 'y', weight: NaN },
      { source: 'x', target: 'z', weight: 2 },
    ];
    const result = buildForceGraphData(model, nanRows, config);
    expect(result.edges).toHaveLength(2);
    // NaN weight → no width on that edge
    expect(result.edges[0]).toEqual({ source: 'x', target: 'y' });
    expect(result.edges[1]).toEqual({ source: 'x', target: 'z', width: 2 });
  });

  it('cycles tones beyond 8 nodes (wraps back to category1)', () => {
    const manyRows: Row[] = Array.from({ length: 9 }, (_, i) => ({
      source: `node${i}`,
      target: `node${i + 1}`,
    }));
    const result = buildForceGraphData(model, manyRows, { source: 'source', target: 'target' });
    // 10 distinct nodes (node0..node9)
    expect(result.nodes).toHaveLength(10);
    // node8 (index 8) should cycle back to category1
    const node8 = result.nodes.find((n) => n.id === 'node8');
    expect(node8?.tone).toBe('category1');
  });
});
