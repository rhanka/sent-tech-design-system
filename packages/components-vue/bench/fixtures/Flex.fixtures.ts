import type { Fixture } from './types.js';
export default [
  { id: 'default', props: {}, slots: { default: 'Hello' } },
  { id: 'column-centered', props: { direction: 'column', align: 'center', justify: 'between', gap: 4 }, slots: { default: '<span>A</span><span>B</span>' } },
  { id: 'inline-wrap', props: { inline: true, wrap: true, gap: 2, as: 'section' }, slots: { default: '<strong>Hi</strong>' } },
  { id: 'reversed', props: { direction: 'row-reverse', align: 'stretch', justify: 'evenly', gap: 12 }, slots: { default: 'Rev' } },
  { id: 'custom-attrs', props: { class: 'consumer', style: 'color: red', title: 'Box', 'data-bench': 'flex' }, slots: { default: '<em>X</em>' } },
  { id: 'gap-zero', props: { gap: 0, direction: 'column-reverse', align: 'baseline' }, slots: { default: '' } },
] satisfies Fixture[];
