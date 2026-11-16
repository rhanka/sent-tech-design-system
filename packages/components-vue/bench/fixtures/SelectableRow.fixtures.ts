import type { Fixture } from './types.js';
export default [
  { id: 'default', props: {}, slots: { default: 'Row' } },
  { id: 'stacked', props: { selected: true, value: 'a', accentBar: true }, slots: { default: 'Row', caption: 'Caption', leading: '<b>L</b>', trailing: '<em>T</em>' } },
  { id: 'link', props: { href: '/a', selected: true, class: 'consumer', 'data-bench': 'row' }, slots: { default: 'Link' } },
  { id: 'disabled', props: { href: '/a', disabled: true, role: 'button', selected: true }, slots: { default: 'Disabled' } },
  { id: 'button', props: { role: 'button', selected: false }, slots: { default: 'Button' } },
] satisfies Fixture[];
