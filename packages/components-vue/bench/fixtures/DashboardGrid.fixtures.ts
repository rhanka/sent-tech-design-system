import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { tiles: [{ id: 'a', x: 0, y: 0, w: 6, h: 2, title: 'Alpha', value: '7' }] } },
  { id: 'multiple-described', props: { tiles: [{ id: 'a', x: 0, y: 0, w: 4, h: 1, title: 'Alpha', description: 'First', value: '1' }, { id: 'b', x: 8, y: 2, w: 4, h: 1, title: 'Beta' }], label: 'My grid', columns: 12, rowHeight: 100, gap: 8 } },
  { id: 'editable-clamped', props: { tiles: [{ id: 'a', x: 99, y: -3, w: 99, h: 0, title: 'Wide' }], editable: true, columns: 6, class: 'consumer', style: 'color: red', 'data-bench': 'grid' } },
  { id: 'bare-tiles', props: { tiles: [{ id: 'x', x: 0, y: 0, w: 2, h: 1 }, { id: 'y', x: 2, y: 1, w: 2, h: 1 }] } },
  { id: 'zero-columns', props: { tiles: [{ id: 'a', x: 0, y: 0, w: 1, h: 1 }], columns: 0, rowHeight: 10, gap: 0 } },
  { id: 'empty', props: { tiles: [] } },
] satisfies Fixture[];
