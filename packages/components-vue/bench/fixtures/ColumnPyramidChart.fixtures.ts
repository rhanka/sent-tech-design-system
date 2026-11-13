import type { Fixture } from './types.js';
const data = [
  { category: 'Alpha', value: 40 },
  { category: 'Beta', value: 75 },
  { category: 'Gamma', value: 55 },
];
export default [
  { id: 'default', props: { data, label: 'Pyramids' } },
  { id: 'custom-size', props: { data, label: 'Pyramids', width: 640, height: 360, tone: 'category3', class: 'consumer', style: 'color: red', 'data-bench': 'chart' } },
  { id: 'tones', props: { data: [{ category: 'A', value: 20, tone: 'category5' }, { category: 'B', value: 80, tone: 'category7' }, { category: 'C', value: 35 }], label: 'Mixed' } },
  { id: 'filtered', props: { data: [{ category: 'Kept', value: 10 }, { category: 'Zero', value: 0 }, { category: 'Neg', value: -5 }], label: 'Filtered' } },
  { id: 'single', props: { data: [{ category: 'Solo', value: 42 }], label: 'Solo' } },
  { id: 'empty', props: { data: [], label: 'No data' } },
] satisfies Fixture[];
