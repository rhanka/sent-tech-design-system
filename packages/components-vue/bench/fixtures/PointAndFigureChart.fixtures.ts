import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { data: [{ date: 0, close: 10 }, { date: 1, close: 12 }, { date: 2, close: 11 }, { date: 3, close: 14 }], label: 'P&F' } },
  { id: 'uptrend', props: { data: [{ date: 0, close: 10 }, { date: 1, close: 13 }, { date: 2, close: 16 }, { date: 3, close: 15 }], label: 'P&F', boxSize: 2, reversal: 3 } },
  { id: 'invalid', props: { data: [{ date: 0, close: 10 }, { date: NaN, close: 12 }, { date: 2, close: Infinity }], label: 'Bad', width: 480, height: 240, class: 'consumer', style: 'color: red', 'data-bench': 'pnf' } },
  { id: 'empty', props: { data: [], label: 'No data' } },
] satisfies Fixture[];
