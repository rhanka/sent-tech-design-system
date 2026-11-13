import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { colors: ['#fff', '#f00', '#00f'], label: 'Scale' } },
  { id: 'vertical', props: { colors: ['#000', '#fff'], orientation: 'vertical', length: 120, thickness: 16 } },
  { id: 'ends', props: { colors: ['#fff', '#000'], min: '0', max: '100' } },
  { id: 'single-color', props: { colors: ['#f00'] } },
  { id: 'custom', props: { colors: ['#fff', '#123456'], label: 'S', class: 'consumer', style: 'color: red', 'data-bench': 'scale' } },
] satisfies Fixture[];
