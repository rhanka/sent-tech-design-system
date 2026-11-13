import type { Fixture } from './types.js';
const data = [
  { category: 'Alpha', value: 8, low: 6, high: 11 },
  { category: 'Beta', value: 5, low: 2, high: 7 },
  { category: 'Gamma', value: 10, low: 9, high: 12 },
];
export default [
  { id: 'default', props: { data, label: 'Estimates' } },
  { id: 'custom-tone', props: { data, label: 'Estimates', tone: 'category3', width: 640, height: 320, class: 'consumer', style: 'color: red', 'data-bench': 'chart' } },
  { id: 'clamped-mid', props: { data: [{ category: 'Out', value: 20, low: 3, high: 6 }], label: 'Estimates' } },
  { id: 'inverted', props: { data: [{ category: 'Rev', value: 5, low: 8, high: 2 }], label: 'Estimates' } },
  { id: 'invalid', props: { data: [{ category: 'Bad', value: NaN, low: 1, high: 2 }, { category: 'Good', value: 4, low: 1, high: 9 }], label: 'Estimates' } },
  { id: 'empty', props: { data: [], label: 'No estimates' } },
] satisfies Fixture[];
