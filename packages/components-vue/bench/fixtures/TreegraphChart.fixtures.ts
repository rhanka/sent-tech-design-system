import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { data: [{ id: 'root', label: 'Root' }, { id: 'a', parentId: 'root', label: 'Branch A', tone: 'category3' }, { id: 'b', parentId: 'root', label: 'Branch B' }, { id: 'a1', parentId: 'a', label: 'Leaf A1' }], label: 'Tree' } },
  { id: 'single', props: { data: [{ id: 'only', label: 'Only node' }], label: 'Single' } },
  { id: 'long-labels', props: { data: [{ id: 'root', label: 'A very long root node label here' }, { id: 'child', parentId: 'root', label: 'Another extremely long child node label' }], label: 'Clipped' } },
  { id: 'empty', props: { data: [], label: 'Empty' } },
  { id: 'custom-size', props: { data: [{ id: 'root', label: 'Root' }, { id: 'c', parentId: 'root', label: 'Child' }], label: 'Sized', width: 800, height: 300 } },
  { id: 'custom-attrs', props: { data: [{ id: 'root', label: 'Root' }], label: 'Custom', class: 'consumer', style: 'color: red', 'data-bench': 'treegraphChart' } },
] satisfies Fixture[];
