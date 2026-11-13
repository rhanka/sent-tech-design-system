import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { data: [{ label: 'A', values: [1, 2, 2, 3, 3, 3, 4, 5, 6] }, { label: 'B', values: [2, 3, 4, 4, 5, 5, 8], tone: 'category4' }], label: 'Violins' } },
  { id: 'no-quartiles', props: { data: [{ label: 'A', values: [1, 2, 3, 4] }], quartiles: false, label: 'Bare' } },
  { id: 'single', props: { data: [{ label: 'Only', values: [7, 7, 7] }], bins: 5, label: 'Single' } },
  { id: 'empty', props: { data: [], label: 'Empty' } },
  { id: 'custom-size', props: { data: [{ label: 'A', values: [1, 3, 2] }], label: 'Sized', width: 600, height: 320 } },
  { id: 'custom-attrs', props: { data: [{ label: 'A', values: [1, 3, 2] }], label: 'Custom', class: 'consumer', style: 'color: red', 'data-bench': 'violinChart' } },
] satisfies Fixture[];
