import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { data: [1, 3, 2, 5, 4] } },
  { id: 'area-success', props: { data: [0, 5, 10, 5], tone: 'success', area: true, label: 'Trend' } },
  { id: 'custom', props: { data: [2, 2, 2], width: 200, height: 40, tone: 'error', strokeWidth: 2, class: 'consumer', style: 'color: red', 'data-bench': 'spark' } },
  { id: 'empty', props: { data: [], label: 'Empty' } },
  { id: 'single', props: { data: [7] } },
] satisfies Fixture[];
