import type { Fixture } from './types.js';
const data = [
  { category: 'Alpha', low: 2, high: 8 },
  { category: 'Beta', low: 4, high: 12 },
  { category: 'Gamma', low: 1, high: 5 },
];
export default [
  { id: 'default', props: { data, label: 'Ranges' } },
  { id: 'custom-tones', props: { data, label: 'Ranges', lowTone: 'category3', highTone: 'category4', lowLabel: 'Min', highLabel: 'Max', width: 640, height: 320, class: 'consumer', style: 'color: red', 'data-bench': 'chart' } },
  { id: 'inverted', props: { data: [{ category: 'Rev', low: 10, high: 3 }], label: 'Ranges' } },
  { id: 'single', props: { data: [{ category: 'One', low: 0, high: 10 }], label: 'Ranges' } },
  { id: 'invalid', props: { data: [{ category: 'Bad', low: NaN, high: 5 }, { category: 'Good', low: 1, high: 2 }], label: 'Ranges' } },
  { id: 'empty', props: { data: [], label: 'No ranges' } },
] satisfies Fixture[];
