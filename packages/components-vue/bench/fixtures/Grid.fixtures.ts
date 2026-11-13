import type { Fixture } from './types.js';
export default [
  { id: 'default', props: {}, slots: { default: 'Cells' } },
  { id: 'three-columns', props: { columns: 3, gap: 4 }, slots: { default: '<span>A</span><span>B</span><span>C</span>' } },
  { id: 'min-width', props: { minItemWidth: '200px', gap: 2 }, slots: { default: 'Auto' } },
  { id: 'min-width-priority', props: { columns: 2, minItemWidth: '180px' }, slots: { default: 'Wins' } },
  { id: 'custom-attrs', props: { columns: 2, class: 'consumer', style: 'color: red', title: 'Grid', 'data-bench': 'grid' }, slots: { default: '<em>X</em>' } },
  { id: 'as-section', props: { columns: 1, as: 'section' }, slots: { default: '' } },
] satisfies Fixture[];
