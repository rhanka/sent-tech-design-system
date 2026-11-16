import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { data: [{ x: 'A', y: 10 }, { x: 'B', y: 20 }, { x: 'C', y: 5 }], label: 'Steps' } },
  { id: 'numeric-tone', props: { data: [{ x: 1, y: 2 }, { x: 2, y: 8 }], label: 'Numeric', tone: 'category3', width: 400, height: 300, class: 'consumer', style: 'color: red', 'data-bench': 'step' } },
  { id: 'empty', props: { data: [], label: 'Empty' } },
  { id: 'single', props: { data: [{ x: 'Only', y: 42 }], label: 'Single' } },
  { id: 'invalid', props: { data: [{ x: 'A', y: Number.NaN }, { x: 'B', y: 10 }], label: 'Invalid' } },
] satisfies Fixture[];
