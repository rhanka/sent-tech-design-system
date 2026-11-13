import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { nodes: [{ id: 'a', label: 'Source' }, { id: 'b', label: 'Middle' }, { id: 'c', label: 'Target' }], links: [{ source: 'a', target: 'b', value: 10 }, { source: 'b', target: 'c', value: 8 }], label: 'Flow' } },
  { id: 'tones-custom', props: { nodes: [{ id: 'x', label: 'X', tone: 'category3' }, { id: 'y', label: 'Y', tone: 'category5' }], links: [{ source: 'x', target: 'y', value: 5, tone: 'category3' }], label: 'Tones', width: 600, height: 300, class: 'consumer', style: 'color: red', 'data-bench': 'sankey' } },
  { id: 'orphan', props: { nodes: [{ id: 'a', label: 'A' }], links: [{ source: 'a', target: 'missing', value: 3 }, { source: 'missing2', target: 'a', value: 2 }], label: 'Orphan' } },
  { id: 'empty', props: { nodes: [], links: [], label: 'Empty' } },
  { id: 'single-node', props: { nodes: [{ id: 'solo', label: 'Solo' }], links: [], label: 'Solo' } },
  { id: 'zero-value', props: { nodes: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], links: [{ source: 'a', target: 'b', value: 0 }], label: 'Zero' } },
] satisfies Fixture[];
