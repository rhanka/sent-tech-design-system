import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { open: true, title: 'Settings', description: 'Edit preferences' }, slots: { default: 'Body content', footer: 'Footer actions' } },
  { id: 'left-placement', props: { open: true, title: 'Nav', placement: 'left', class: 'consumer', style: 'color: red', 'data-bench': 'drawer' }, slots: { default: 'Links' } },
  { id: 'bottom-no-title', props: { open: true, placement: 'bottom', closeLabel: 'Dismiss' }, slots: { default: 'Content' } },
  { id: 'open-title-only', props: { open: true, title: 'Plain' }, slots: { default: 'Body' } },
  { id: 'closed', props: { open: false, title: 'Hidden' }, slots: { default: 'Body' } },
  { id: 'closed-empty', props: {} },
] satisfies Fixture[];
