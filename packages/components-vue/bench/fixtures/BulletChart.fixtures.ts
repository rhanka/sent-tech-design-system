import type { Fixture } from './types.js';
const data = [
  { label: 'Revenue', value: 55, target: 70, ranges: [30, 50, 80] },
  { label: 'Users', value: 82, target: 75, ranges: [40, 60, 90] },
  { label: 'NPS', value: 38, target: 60, ranges: [20, 45, 75] },
];
export default [
  { id: 'default', props: { data, label: 'Currents vs targets' } },
  { id: 'vertical', props: { data, label: 'Vertical', orientation: 'vertical' } },
  { id: 'custom-size', props: { data: [{ label: 'Loss', value: -10, target: 5, ranges: [0, 5, 15] }, { label: 'Gain', value: 20, target: 25, ranges: [5, 15, 30] }], label: 'Balance', width: 640, height: 320, class: 'consumer', style: 'color: red', 'data-bench': 'chart' } },
  { id: 'no-ranges', props: { data: [{ label: 'A', value: 10, target: 20 }, { label: 'B', value: 30, target: 25 }], label: 'Plain' } },
  { id: 'filtered', props: { data: [{ label: 'Kept', value: 10, target: 20 }, { label: 'Bad', value: Number.NaN, target: 99 }], label: 'Filtered' } },
  { id: 'empty', props: { data: [], label: 'No data' } },
] satisfies Fixture[];
