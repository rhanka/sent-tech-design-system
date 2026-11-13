import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { data: [{ series: 'S1', buckets: [{ at: 1, value: 'up' }, { at: 2, value: 'down', tone: 'error' }] }], label: 'History' } },
  { id: 'custom', props: { data: [{ series: 'A', buckets: [{ at: 10, value: 1 }] }], label: 'Custom', width: 500, height: 280, class: 'consumer', style: 'color: red', 'data-bench': 'history' } },
  { id: 'empty', props: { data: [], label: 'Empty' } },
  { id: 'invalid', props: { data: [{ series: '', buckets: [] }, { series: 'Bad', buckets: [{ at: Number.NaN, value: 'x' }] }], label: 'Invalid' } },
  { id: 'numeric', props: { data: [{ series: 'N', buckets: [{ at: 0, value: 0 }] }], label: 'Numeric' } },
] satisfies Fixture[];
