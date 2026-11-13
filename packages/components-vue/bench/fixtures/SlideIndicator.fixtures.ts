import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { count: 3, current: 1 } },
  { id: 'bars-lg', props: { count: 5, current: 0, size: 'lg', variant: 'bars', label: 'Slide' } },
  { id: 'sm-last', props: { count: 4, current: 3, size: 'sm' } },
  { id: 'empty', props: { count: 0, current: 0 } },
  { id: 'custom', props: { count: 2, current: 0, class: 'consumer', style: 'color: red', 'data-bench': 'slide' } },
] satisfies Fixture[];
