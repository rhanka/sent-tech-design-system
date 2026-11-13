import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { data: [{ label: 'Jan', open: 10, high: 14, low: 8, close: 13 }, { label: 'Feb', open: 13, high: 15, low: 11, close: 12 }], label: 'Price' } },
  { id: 'down-trend', props: { data: [{ label: 'A', open: 20, high: 21, low: 15, close: 16 }, { label: 'B', open: 16, high: 17, low: 10, close: 11 }], label: 'Falling' } },
  { id: 'empty', props: { data: [], label: 'No candles' } },
  { id: 'invalid-filtered', props: { data: [{ label: 'Good', open: 5, high: 7, low: 4, close: 6 }, { label: 'Bad', open: 5, high: 7, low: 4, close: NaN }], label: 'Clean' } },
  { id: 'custom-attrs', props: { data: [{ label: 'X', open: 1, high: 2, low: 0.5, close: 1.5 }], label: 'Sized', width: 640, height: 300, class: 'consumer', style: 'color: red', 'data-bench': 'heikin' } },
  { id: 'flat', props: { data: [{ label: 'F', open: 10, high: 10, low: 10, close: 10 }], label: 'Flat' } },
] satisfies Fixture[];
