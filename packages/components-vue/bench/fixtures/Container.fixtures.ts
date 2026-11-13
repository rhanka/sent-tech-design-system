import type { Fixture } from './types.js';
export default [
  { id: 'default', props: {}, slots: { default: 'Content' } },
  { id: 'small-unpadded', props: { size: 'sm', padding: false }, slots: { default: 'Small' } },
  { id: 'xl-section', props: { size: 'xl', as: 'section' }, slots: { default: '<strong>Extra</strong> wide' } },
  { id: 'full-main', props: { size: 'full', as: 'main', class: 'consumer', style: 'color: red', 'data-bench': 'layout' }, slots: { default: 'Full' } },
  { id: 'md-nopad', props: { size: 'md', padding: true }, slots: { default: 'Medium padded' } },
  { id: 'empty', props: {} },
] satisfies Fixture[];
