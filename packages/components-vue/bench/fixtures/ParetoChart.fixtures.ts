import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { data: [{ label: 'A', value: 50 }, { label: 'B', value: 30 }, { label: 'C', value: 20 }], label: 'Effort' } },
  { id: 'tones', props: { data: [{ label: 'A', value: 10, tone: 'category2' }, { label: 'B', value: 5 }], label: 'Effort', width: 640, height: 320 } },
  { id: 'negative-filtered', props: { data: [{ label: 'Loss', value: -5 }, { label: 'Zero', value: 0 }, { label: 'Gain', value: 10 }], label: 'Balance', class: 'consumer', style: 'color: red', 'data-bench': 'pareto' } },
  { id: 'empty', props: { data: [], label: 'No data' } },
] satisfies Fixture[];
