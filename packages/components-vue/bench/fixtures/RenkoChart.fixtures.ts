import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { data: [{ date: 1, close: 10 }, { date: 2, close: 12 }, { date: 3, close: 11 }, { date: 4, close: 14 }], label: 'Renko' } },
  { id: 'fixed-box', props: { data: [{ date: 1, close: 100 }, { date: 2, close: 102 }, { date: 3, close: 98 }, { date: 4, close: 105 }], boxSize: 2, label: 'Fixed', width: 500, height: 300, class: 'consumer', style: 'color: red', 'data-bench': 'renko' } },
  { id: 'downtrend', props: { data: [{ date: 1, close: 50 }, { date: 2, close: 45 }, { date: 3, close: 40 }, { date: 4, close: 42 }], label: 'Down' } },
  { id: 'empty', props: { data: [], label: 'Empty' } },
  { id: 'single', props: { data: [{ date: 1, close: 10 }], label: 'Single' } },
  { id: 'invalid', props: { data: [{ date: Number.NaN, close: 10 }, { date: 2, close: Number.NaN }, { date: 3, close: 12 }], label: 'Invalid' } },
] satisfies Fixture[];
