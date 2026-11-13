import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { value: 65, label: 'Load' } },
  { id: 'percent', props: { value: 33.6, label: 'Fill', format: 'percent' } },
  { id: 'thresholds', props: { value: 72, label: 'Usage', thresholds: [{ value: 50, tone: 'success' }, { value: 80, tone: 'warning' }, { value: 95, tone: 'error' }] } },
  { id: 'unit-size', props: { value: 42, min: 0, max: 200, unit: 'ms', size: 300, thickness: 30, label: 'Latency' } },
  { id: 'custom-attrs', props: { value: 10, class: 'consumer', style: 'color: red', 'data-bench': 'gauge' } },
  { id: 'over-max', props: { value: 150, label: 'Clamped' } },
] satisfies Fixture[];
