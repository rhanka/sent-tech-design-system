import type { Fixture } from './types.js';
const data = [
  { label: 'Up', value: 12 },
  { label: 'Down', value: -8 },
  { label: 'Flat', value: 0 },
];
export default [
  { id: 'default', props: { data, label: 'Changes' } },
  { id: 'custom-format', props: { data, label: 'Changes', format: (v: number) => `${v} pt`, width: 640, height: 300, class: 'consumer', style: 'color: red', 'data-bench': 'chart' } },
  { id: 'fixed-domain', props: { data, label: 'Changes', domain: [-20, 20] } },
  { id: 'invalid-domain', props: { data, label: 'Changes', domain: [5, 10] } },
  { id: 'no-legend-tones', props: { data: [{ label: 'A', value: 5, tone: 'negative' }, { label: 'B', value: -5, tone: 'positive' }], label: 'Changes', showLegend: false } },
  { id: 'empty', props: { data: [], label: 'No changes' } },
] satisfies Fixture[];
