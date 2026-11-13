import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { data: [{ label: 'Jan', open: 10, high: 14, low: 8, close: 13 }, { label: 'Feb', open: 13, high: 15, low: 11, close: 12 }], label: 'Price' } },
  { id: 'mixed-fills', props: { data: [{ label: 'A', open: 10, high: 12, low: 9, close: 11 }, { label: 'B', open: 11, high: 12, low: 10, close: 10.5 }, { label: 'C', open: 10.5, high: 12, low: 10, close: 11.5 }], label: 'Mixed' } },
  { id: 'empty', props: { data: [], label: 'None' } },
  { id: 'invalid-filtered', props: { data: [{ label: 'Good', open: 5, high: 7, low: 4, close: 6 }, { label: 'Bad', open: 5, high: 7, low: 4, close: NaN }], label: 'Clean' } },
  { id: 'custom-attrs', props: { data: [{ label: 'X', open: 1, high: 2, low: 0.5, close: 1.5 }], label: 'Sized', width: 640, height: 300, class: 'consumer', style: 'color: red', 'data-bench': 'hollow' } },
] satisfies Fixture[];
