import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { value: 3 } },
  { id: 'half-small', props: { value: 3.5, max: 5, allowHalf: true, size: 'sm', label: 'Quality' } },
  { id: 'readonly-large', props: { value: 4, readonly: true, size: 'lg', name: 'rate', label: 'Review', class: 'consumer', style: 'color: red', 'data-bench': 'rating' } },
  { id: 'zero-max', props: { value: 0, max: 10, allowHalf: false } },
  { id: 'uncontrolled', props: { size: 'md', name: 'rate' } },
  { id: 'full', props: { value: 5, max: 5 } },
] satisfies Fixture[];
