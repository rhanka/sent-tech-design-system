import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { id: 'one', label: 'Section' }, slots: { default: '<p>Body</p>' } },
  { id: 'actions', props: { id: 'two', label: 'Actions' }, slots: { actions: '<button>Add</button>', default: 'Body' } },
  { id: 'attrs', props: { id: 'custom', label: 'Custom', class: 'consumer', style: 'color: red', 'data-bench': 'section' } },
  { id: 'escaped', props: { id: 'escaped', label: '<Title>' }, slots: { default: '<input value="State survives" />' } },
] satisfies Fixture[];
