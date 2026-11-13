import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { color: '#1971c2' } },
  { id: 'circle', props: { color: '#e8590c', shape: 'circle', size: 16 } },
  { id: 'pill', props: { color: '#2f9e44', shape: 'pill', label: 'Green' } },
  { id: 'custom', props: { color: '#f08c00', class: 'consumer', style: 'color: red', 'data-bench': 'swatch' } },
  { id: 'zero-size', props: { color: '#000000', size: 0 } },
] satisfies Fixture[];
