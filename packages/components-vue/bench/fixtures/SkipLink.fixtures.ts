import type { Fixture } from './types.js';
export default [
  { id: 'default', props: {}, slots: { default: 'Skip to content' } },
  { id: 'custom-href', props: { href: '#content' }, slots: { default: 'Skip link' } },
  { id: 'fallback', props: {} },
  { id: 'custom-attrs', props: { href: '#main', class: 'consumer', style: 'color: red', 'data-bench': 'skip' }, slots: { default: 'Skip' } },
] satisfies Fixture[];
