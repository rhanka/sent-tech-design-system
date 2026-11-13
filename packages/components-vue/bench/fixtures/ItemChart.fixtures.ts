import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { data: [{ label: 'Left', value: 55 }, { label: 'Right', value: 45 }], label: 'Assembly' } },
  { id: 'three-parties', props: { data: [{ label: 'A', value: 30, tone: 'category5' }, { label: 'B', value: 20 }, { label: 'C', value: 50, tone: 'category2' }], label: 'Seats' } },
  { id: 'zero-negative', props: { data: [{ label: 'None', value: 0 }, { label: 'Neg', value: -3 }, { label: 'Some', value: 7 }], label: 'Edge' } },
  { id: 'empty', props: { data: [], label: 'Empty' } },
  { id: 'custom-attrs', props: { data: [{ label: 'X', value: 10 }], label: 'Sized', width: 640, height: 360, class: 'consumer', style: 'color: red', 'data-bench': 'item' } },
  { id: 'single', props: { data: [{ label: 'Only', value: 100 }], label: 'All' } },
] satisfies Fixture[];
