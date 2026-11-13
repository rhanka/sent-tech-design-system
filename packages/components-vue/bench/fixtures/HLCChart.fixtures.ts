import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { data: [{ label: 'Mon', high: 14, low: 8, close: 12 }, { label: 'Tue', high: 13, low: 9, close: 10 }], label: 'Range' } },
  { id: 'up-then-down', props: { data: [{ label: 'A', high: 10, low: 9, close: 9.5 }, { label: 'B', high: 12, low: 9, close: 11 }, { label: 'C', high: 11, low: 8, close: 9 }], label: 'Moves' } },
  { id: 'empty', props: { data: [], label: 'None' } },
  { id: 'invalid-filtered', props: { data: [{ label: 'Good', high: 5, low: 4, close: 4.5 }, { label: 'Bad', high: 5, low: 4, close: NaN }], label: 'Clean' } },
  { id: 'custom-attrs', props: { data: [{ label: 'X', high: 3, low: 1, close: 2 }], label: 'Sized', width: 640, height: 300, class: 'consumer', style: 'color: red', 'data-bench': 'hlc' } },
] satisfies Fixture[];
