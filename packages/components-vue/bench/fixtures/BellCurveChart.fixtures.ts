import type { Fixture } from './types.js';
const sample = [42, 47, 51, 49, 55, 53, 46, 58, 50, 52, 44, 57];
export default [
  { id: 'default', props: { data: sample, label: 'Heights' } },
  { id: 'linear', props: { data: sample, label: 'Heights', smooth: false } },
  { id: 'intervals', props: { data: sample, label: 'Heights', tone: 'category3', intervals: 16, width: 640, height: 320, class: 'consumer', style: 'color: red', 'data-bench': 'chart' } },
  { id: 'insufficient', props: { data: [42], label: 'One' } },
  { id: 'zero-sd', props: { data: [7, 7, 7], label: 'Flat' } },
  { id: 'empty', props: { data: [], label: 'None' } },
] satisfies Fixture[];
