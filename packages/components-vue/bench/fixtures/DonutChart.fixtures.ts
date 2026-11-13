import type { Fixture } from './types.js';
const data = [
  { label: 'Alpha', value: 40 },
  { label: 'Beta', value: 30, tone: 'category2' },
  { label: 'Gamma', value: 20, tone: 'category3' },
  { label: 'Tiny', value: 1 },
];
export default [
  { id: 'default', props: { data, label: 'Share' } },
  { id: 'custom-size', props: { data, label: 'Share', size: 300, thickness: 50, centerLabel: 'Total' } },
  { id: 'no-center', props: { data, label: 'Share', centerLabel: null } },
  { id: 'with-labels', props: { data, label: 'Share', dataLabels: true, class: 'consumer', style: 'color: red', 'data-bench': 'chart' } },
  { id: 'two-slices', props: { data: [{ label: 'Yes', value: 75 }, { label: 'No', value: 25 }], label: 'Vote' } },
  { id: 'empty', props: { data: [], label: 'No donut' } },
] satisfies Fixture[];
