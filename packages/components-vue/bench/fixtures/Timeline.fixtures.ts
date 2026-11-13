import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { items: [{ title: 'Deploy', tone: 'success' }, { title: 'Rollback', tone: 'danger', meta: '12:04', description: 'Reverted release' }] } },
  { id: 'horizontal', props: { orientation: 'horizontal', items: [{ title: 'Start' }, { title: 'Milestone', meta: 'Q3' }] } },
  { id: 'tones', props: { items: [{ title: 'Neutral' }, { title: 'Info', tone: 'info' }, { title: 'Warning', tone: 'warning' }, { title: 'Danger', tone: 'danger' }, { title: 'Success', tone: 'success' }] } },
  { id: 'custom-attrs', props: { items: [{ title: 'Event' }], class: 'consumer', style: 'color: red', 'data-bench': 'timeline' } },
  { id: 'empty', props: { items: [] } },
] satisfies Fixture[];
