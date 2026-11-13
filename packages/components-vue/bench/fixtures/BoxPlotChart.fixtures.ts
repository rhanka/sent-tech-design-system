import type { Fixture } from './types.js';
const data = [
  { label: 'Alpha', min: 5, q1: 10, median: 13, q3: 16, max: 20, outliers: [24, 2] },
  { label: 'Beta', min: 8, q1: 12, median: 15, q3: 18, max: 22, tone: 'category3' },
  { label: 'Gamma', min: 3, q1: 7, median: 11, q3: 14, max: 30, outliers: [45] },
];
export default [
  { id: 'default', props: { data, label: 'Distributions' } },
  { id: 'custom-size', props: { data, label: 'Distributions', width: 800, height: 400, class: 'consumer', style: 'color: red', 'data-bench': 'chart' } },
  { id: 'single', props: { data: [{ label: 'Solo', min: 1, q1: 2, median: 3, q3: 4, max: 5 }], label: 'Solo' } },
  { id: 'no-outliers', props: { data: [{ label: 'A', min: 0, q1: 5, median: 9, q3: 11, max: 15, tone: 'category5' }, { label: 'B', min: 2, q1: 6, median: 10, q3: 13, max: 18, tone: 'category7' }], label: 'Plain' } },
  { id: 'non-finite', props: { data: [{ label: 'A', min: 1, q1: 2, median: 3, q3: 4, max: 5, outliers: [Number.NaN, 20] }], label: 'Filtered' } },
  { id: 'empty', props: { data: [], label: 'No data' } },
] satisfies Fixture[];
