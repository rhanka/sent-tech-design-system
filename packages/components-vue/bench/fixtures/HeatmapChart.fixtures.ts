import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { data: [{ x: 'Mon', y: '9h', value: 10 }, { x: 'Tue', y: '9h', value: 20 }, { x: 'Mon', y: '12h', value: 30 }, { x: 'Tue', y: '12h', value: 40 }], label: 'Traffic' } },
  { id: 'sequential-legend', props: { data: [{ x: 'A', y: 'Top', value: 5 }, { x: 'B', y: 'Top', value: 15 }], scale: 'sequential', legend: true, label: 'Load' } },
  { id: 'custom-tones', props: { data: [{ x: 'A', y: 'Top', value: 1, tone: 'category5' }, { x: 'B', y: 'Top', value: 2, tone: 'category7' }], label: 'Cats' } },
  { id: 'empty', props: { data: [], label: 'Empty grid' } },
  { id: 'custom-attrs', props: { data: [{ x: 'A', y: 'Top', value: 9 }], label: 'Sized', width: 600, height: 360, class: 'consumer', style: 'color: red', 'data-bench': 'heatmap' } },
  { id: 'single', props: { data: [{ x: 'Only', y: 'Cell', value: 0 }], label: 'One' } },
] satisfies Fixture[];
