import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { title: 'No results', message: 'Try another search.' } },
  { id: 'with-action', props: { title: 'Empty', message: 'Nothing here.', action: 'Clear filters', class: 'consumer', style: 'color: red', 'data-bench': 'empty' } },
  { id: 'title-only', props: { title: 'Just a title' } },
  { id: 'action-only', props: { title: 'Title', action: 'Retry' } },
  { id: 'with-slot', props: { title: 'Slot title', message: 'Slot message' }, slots: { default: '<strong>Slot</strong> detail' } },
  { id: 'bare-slot', props: { title: 'Bare' }, slots: { default: 'Slot body' } },
] satisfies Fixture[];
