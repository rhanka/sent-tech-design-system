import type { Fixture } from './types.js';
export default [
  { id: 'default', props: {}, slots: { default: 'Items' } },
  { id: 'gap-aligned', props: { gap: 4, align: 'center', justify: 'between' }, slots: { default: '<span>A</span><span>B</span>' } },
  { id: 'nowrap', props: { wrap: false }, slots: { default: 'No wrap' } },
  { id: 'as-section', props: { as: 'section', gap: 2 }, slots: { default: '<strong>Hi</strong>' } },
  { id: 'custom-attrs', props: { class: 'consumer', style: 'color: red', title: 'Row', 'data-bench': 'inline' }, slots: { default: '<em>X</em>' } },
] satisfies Fixture[];
