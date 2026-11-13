import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { title: 'Details', subtitle: 'Overview' }, slots: { default: 'Panel body' } },
  { id: 'title-only', props: { title: 'Only title' }, slots: { default: 'Body text' } },
  { id: 'subtitle-only', props: { subtitle: 'Only subtitle' }, slots: { default: 'Body text' } },
  { id: 'with-actions-footer', props: { title: 'Panel', label: 'Panel region', class: 'consumer', style: 'color: red', 'data-bench': 'panel' }, slots: { default: 'Body', actions: '<strong>Act</strong>', footer: 'Footer note' } },
  { id: 'bare', props: {}, slots: { default: 'Just body' } },
  { id: 'empty', props: {} },
] satisfies Fixture[];
