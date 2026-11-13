import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { data: [{ label: 'Alpha', value: 40, z: 0.4 }, { label: 'Beta', value: 30, z: 0.8, tone: 'category3' }, { label: 'Gamma', value: 20, z: 1 }], label: 'Variable pie' } },
  { id: 'single', props: { data: [{ label: 'Only', value: 10, z: 1 }], label: 'Single' } },
  { id: 'empty', props: { data: [], label: 'Empty' } },
  { id: 'filtered-zero', props: { data: [{ label: 'Zero', value: 0, z: 1 }, { label: 'Neg', value: -5, z: 1 }, { label: 'Live', value: 7, z: 0.5 }], label: 'Filtered' } },
  { id: 'custom-size', props: { data: [{ label: 'A', value: 3, z: 0.2 }, { label: 'B', value: 1, z: 0.9 }], label: 'Sized', width: 500, height: 300 } },
  { id: 'custom-attrs', props: { data: [{ label: 'A', value: 3, z: 0.5 }], label: 'Custom', class: 'consumer', style: 'color: red', 'data-bench': 'variablePieChart' } },
] satisfies Fixture[];
