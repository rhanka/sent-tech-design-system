import type { Fixture } from './types.js';
export default [
  { id: 'default', props: {}, slots: { default: 'Hidden?' } },
  { id: 'below-md', props: { below: 'md' }, slots: { default: '<span>XS</span>' } },
  { id: 'above-lg', props: { above: 'lg' }, slots: { default: 'Wide' } },
  { id: 'both-attrs', props: { below: 'sm', above: 'xl', as: 'section' }, slots: { default: 'Mid' } },
  { id: 'custom-attrs', props: { below: 'md', class: 'consumer', style: 'color: red', title: 'Box', 'data-bench': 'hidden' }, slots: { default: '<em>X</em>' } },
] satisfies Fixture[];
