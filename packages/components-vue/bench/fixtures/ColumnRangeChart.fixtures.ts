import type { Fixture } from './types.js';
const data = [
  { category: 'Alpha', low: 2, high: 8 },
  { category: 'Beta', low: 4, high: 12, tone: 'category2' },
  { category: 'Gamma', low: 1, high: 5, tone: 'category3' },
];
export default [
  { id: 'default', props: { data, label: 'Ranges' } },
  { id: 'horizontal-custom-size', props: { data, label: 'Ranges', orientation: 'horizontal', width: 640, height: 320, class: 'consumer', style: 'color: red', 'data-bench': 'chart' } },
  { id: 'fixed-domain', props: { data, label: 'Ranges', domain: [0, 20] } },
  { id: 'invalid-domain', props: { data, label: 'Ranges', domain: [12, 2] } },
  { id: 'inverted-range', props: { data: [{ category: 'Rev', low: 10, high: 3 }, { category: 'Nil', low: 0, high: 0 }], label: 'Ranges' } },
  { id: 'empty', props: { data: [], label: 'No ranges' } },
] satisfies Fixture[];
