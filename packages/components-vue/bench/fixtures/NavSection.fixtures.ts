import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { label: 'Section' }, slots: { default: '<p>Body</p>' } },
  { id: 'static-count', props: { label: 'Section', count: 0, as: 'h2', class: 'consumer', 'data-bench': 'section' }, slots: { default: 'Body', action: '<button>Add</button>' } },
  { id: 'open', props: { label: 'Section', count: 3, collapsible: true }, slots: { default: '<p>Open</p>', action: 'Ignored' } },
  { id: 'closed', props: { label: 'Section', collapsible: true, open: false }, slots: { default: '<p>Closed</p>' } },
] satisfies Fixture[];
