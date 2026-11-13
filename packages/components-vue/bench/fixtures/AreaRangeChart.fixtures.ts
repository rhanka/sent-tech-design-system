import type { Fixture } from './types.js';
const data = [
  { x: 0, low: 8, high: 14 },
  { x: 1, low: 12, high: 22 },
  { x: 2, low: 10, high: 18 },
  { x: 3, low: 18, high: 30 },
];
export default [
  { id: 'default', props: { data, label: 'Forecast band' } },
  { id: 'smooth', props: { data, label: 'Forecast band', tone: 'category3', smooth: true, width: 640, height: 320, class: 'consumer', style: 'color: red', 'data-bench': 'chart' } },
  { id: 'ordinal', props: { data: [{ x: 'Jan', low: 5, high: 12 }, { x: 'Feb', low: 9, high: 20 }, { x: 'Mar', low: 7, high: 16 }], label: 'Monthly' } },
  { id: 'swapped', props: { data: [{ x: 0, low: 22, high: 12 }, { x: 1, low: 14, high: 8 }], label: 'Swapped' } },
  { id: 'single', props: { data: [{ x: 1, low: 4, high: 9 }], label: 'Solo' } },
  { id: 'empty', props: { data: [], label: 'No data' } },
] satisfies Fixture[];
