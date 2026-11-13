import type { Fixture } from './types.js';
export default [
  { id: 'default', props: {}, slots: { default: 'New' } },
  { id: 'success-small', props: { tone: 'success', size: 'sm' }, slots: { default: 'Active' } },
  { id: 'dismissible', props: { dismissible: true, dismissLabel: 'Remove', tone: 'info' }, slots: { default: 'Filter' } },
  { id: 'disabled-dismissible', props: { tone: 'error', size: 'sm', disabled: true, dismissible: true }, slots: { default: '<strong>Locked</strong>' } },
  { id: 'custom-attrs', props: { tone: 'warning', class: 'consumer', style: 'color: red', title: 'Note', 'data-bench': 'tag' }, slots: { default: 'Caution' } },
  { id: 'empty', props: {} },
] satisfies Fixture[];
