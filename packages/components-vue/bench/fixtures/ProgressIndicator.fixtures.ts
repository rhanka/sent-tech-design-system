import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { items: [{ label: 'One', status: 'complete' }, { label: 'Two', status: 'current' }, { label: 'Three', status: 'upcoming' }] } },
  { id: 'vertical-alias', props: { vertical: true, items: [{ label: 'A', status: 'invalid', description: 'Broken' }, { label: 'B', status: 'disabled' }] } },
  { id: 'incomplete', props: { orientation: 'vertical', items: [{ label: 'A', status: 'incomplete' }, { label: 'B' }], class: 'consumer', style: 'color: red', 'data-bench': 'indicator' } },
  { id: 'empty', props: { items: [] } },
] satisfies Fixture[];
