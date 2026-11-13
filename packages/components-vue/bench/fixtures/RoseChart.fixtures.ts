import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { data: [{ label: 'Alpha', value: 10 }, { label: 'Beta', value: 25 }, { label: 'Gamma', value: 5, tone: 'category8' }], label: 'Rose' } },
  { id: 'single', props: { data: [{ label: 'Only', value: 100 }], label: 'Single' } },
  { id: 'zero-mixed', props: { data: [{ label: 'Zero', value: 0 }, { label: 'Small', value: 2 }, { label: 'Big', value: 50 }], label: 'Mixed', width: 400, height: 360, class: 'consumer', style: 'color: red', 'data-bench': 'rose' } },
  { id: 'empty', props: { data: [], label: 'Empty' } },
  { id: 'negative', props: { data: [{ label: 'Loss', value: -10 }, { label: 'Gain', value: 10 }], label: 'Balance' } },
  { id: 'decimal', props: { data: [{ label: 'Half', value: 3.5 }, { label: 'Quarter', value: 0.25 }], label: 'Decimals' } },
] satisfies Fixture[];
