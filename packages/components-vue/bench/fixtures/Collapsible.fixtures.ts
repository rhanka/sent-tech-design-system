import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { title: 'Details' }, slots: { default: '<p>Hidden body</p>' } },
  { id: 'open', props: { title: 'Details', open: true }, slots: { default: '<p>Visible body</p>' } },
  { id: 'closed', props: { title: 'Details', open: false }, slots: { default: '<p>Hidden</p>' } },
  { id: 'trailing', props: { title: 'Details', open: true }, slots: { default: '<p>Body</p>', trailing: '<span class="badge">3</span>' } },
  { id: 'custom', props: { title: 'Details', disabled: true, onToggle: (_open: boolean) => {}, class: 'consumer', style: 'color: red', 'data-bench': 'coll' } },
] satisfies Fixture[];
