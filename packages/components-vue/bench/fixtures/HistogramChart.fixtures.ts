import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { data: [1, 2, 2, 3, 3, 3, 4, 5, 6, 9], label: 'Scores' } },
  { id: 'bins-count', props: { data: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100], bins: 4, label: 'Ranges' } },
  { id: 'pre-binned', props: { data: [{ label: 'Q1', value: 12 }, { label: 'Q2', value: 19, tone: 'category3' }, { label: 'Q3', value: 8 }], label: 'Quarters' } },
  { id: 'empty', props: { data: [], label: 'None' } },
  { id: 'custom-attrs', props: { data: [1, 2, 3], label: 'Sized', width: 640, height: 300, class: 'consumer', style: 'color: red', 'data-bench': 'histogram' } },
  { id: 'flat', props: { data: [5, 5, 5], label: 'Flat' } },
] satisfies Fixture[];
