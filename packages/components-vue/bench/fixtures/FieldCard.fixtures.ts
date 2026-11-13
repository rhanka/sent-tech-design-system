import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { label: 'Name' }, slots: { default: 'Body content' } },
  { id: 'plain-accent', props: { label: 'Accent', variant: 'accent', tone: 'category3' }, slots: { default: 'Body' } },
  { id: 'plain', props: { label: 'Plain', variant: 'plain' }, slots: { default: 'Body' } },
  { id: 'comments-static', props: { label: 'Counted', commentCount: 4, class: 'consumer', style: 'color: red', 'data-bench': 'card' }, slots: { default: 'Body' } },
  { id: 'comments-button', props: { label: 'Openable', commentCount: 2, onOpenComments: () => {} }, slots: { default: 'Body' } },
  { id: 'comments-handler-zero', props: { label: 'Zero', onOpenComments: () => {} }, slots: { default: 'Body' } },
] satisfies Fixture[];
