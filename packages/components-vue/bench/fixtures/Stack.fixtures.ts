import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { gap: 2 }, slots: { default: '<span>A</span><span>B</span>' } },
  { id: 'aligned', props: { gap: 4, align: 'center', justify: 'between' }, slots: { default: 'Items' } },
  { id: 'as-section', props: { as: 'section', gap: 1, class: 'consumer', 'data-bench': 'stack' }, slots: { default: 'Section' } },
  { id: 'empty', props: {} },
] satisfies Fixture[];
