import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { data: [{ label: 'Visit', value: 100 }, { label: 'Signup', value: 60 }, { label: 'Buy', value: 30 }], label: 'Funnel' } },
  { id: 'horizontal-legend', props: { data: [{ label: 'A', value: 80, tone: 'category2' }, { label: 'B', value: 40 }], orientation: 'horizontal', legend: true, label: 'Steps' } },
  { id: 'of-previous', props: { data: [{ label: 'A', value: 100 }, { label: 'B', value: 50 }, { label: 'C', value: 25 }], percentMode: 'ofPrevious', label: 'Conversion' } },
  { id: 'no-percentages', props: { data: [{ label: 'Only', value: 10 }], showPercentages: false, label: 'Single' } },
  { id: 'custom-attrs', props: { data: [{ label: 'X', value: 5 }, { label: 'Y', value: 5 }], label: 'Sized', width: 640, height: 320, class: 'consumer', style: 'color: red', 'data-bench': 'funnel' } },
  { id: 'edge-values', props: { data: [{ label: 'Zero', value: 0 }, { label: 'Neg', value: -4 }, { label: 'Pos', value: 20 }], label: 'Edges' } },
] satisfies Fixture[];
