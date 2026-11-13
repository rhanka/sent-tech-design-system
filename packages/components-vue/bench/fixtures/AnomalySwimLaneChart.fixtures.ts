import type { Fixture } from './types.js';
const data = [
  { job: 'Nightly ETL', buckets: [{ at: 0, score: 12 }, { at: 1, score: 48 }, { at: 2, score: 90 }] },
  { job: 'Streaming', buckets: [{ at: 1, score: 30 }, { at: 2, score: 64 }] },
];
export default [
  { id: 'default', props: { data, label: 'Anomaly scores' } },
  { id: 'categorical', props: { data, label: 'Anomaly scores', scale: 'categorical', max: 100 } },
  { id: 'custom-size', props: { data, label: 'Custom', width: 640, height: 320, size: 480, class: 'consumer', style: 'color: red', 'data-bench': 'chart' } },
  { id: 'single-bucket', props: { data: [{ job: 'Solo', buckets: [{ at: 1000, score: 2 }] }], label: 'Solo' } },
  { id: 'filtered', props: { data: [{ job: 'Kept', buckets: [{ at: 0, score: 5 }, { at: Number.NaN, score: 9 }] }, { job: '', buckets: [{ at: 1, score: 99 }] }], label: 'Filtered' } },
  { id: 'empty', props: { data: [], label: 'No jobs' } },
] satisfies Fixture[];
