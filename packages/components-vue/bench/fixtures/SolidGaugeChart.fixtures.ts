import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { value: 65, label: 'Load' } },
  { id: 'percent', props: { value: 80, format: 'percent', label: 'CPU' } },
  { id: 'thresholds-unit', props: { value: 42, min: 0, max: 100, thresholds: [{ value: 50, tone: 'success' }, { value: 80, tone: 'error' }], unit: 'ms', size: 260 } },
  { id: 'custom-attrs', props: { value: 10, class: 'consumer', style: 'color: red', 'data-bench': 'gauge' } },
  { id: 'empty-angles', props: { value: 0, startAngle: 180, endAngle: 180 } },
] satisfies Fixture[];
