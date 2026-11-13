import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { data: [{ label: 'Revenue', value: 100 }, { label: 'Costs', value: -40 }, { label: 'Other', value: 20 }, { label: 'Net', value: 0, type: 'total' }], label: 'Waterfall' } },
  { id: 'single', props: { data: [{ label: 'Only', value: 5 }], label: 'Single' } },
  { id: 'empty', props: { data: [], label: 'Empty' } },
  { id: 'no-connectors', props: { data: [{ label: 'A', value: 10 }, { label: 'B', value: -3 }], connectors: false, label: 'Bare' } },
  { id: 'custom-format', props: { data: [{ label: 'A', value: 1.5 }], format: (v: number) => `${v.toFixed(1)}k`, label: 'Formatted' } },
  { id: 'custom-attrs', props: { data: [{ label: 'A', value: 8 }], label: 'Custom', class: 'consumer', style: 'color: red', 'data-bench': 'waterfallChart' } },
] satisfies Fixture[];
