import type { Fixture } from './types.js';
export default [
  { id: 'default', props: {}, slots: { default: '<span>A</span><span>B</span>' } },
  { id: 'gutter-wrap', props: { gutter: 8, wrap: true }, slots: { default: 'Items' } },
  { id: 'center-between', props: { gutter: 2, align: 'center', justify: 'space-between', wrap: false }, slots: { default: '<strong>Hi</strong>' } },
  { id: 'as-section', props: { as: 'section', justify: 'center', class: 'consumer', style: 'color: red', 'data-bench': 'row' }, slots: { default: 'Section' } },
  { id: 'empty', props: {} },
] satisfies Fixture[];
