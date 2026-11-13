import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { data: [{ at: 0, speed: 12, direction: 90 }, { at: 3, speed: 57, direction: 180 }, { at: 6, speed: 5, direction: 270 }, { at: 9, speed: 30, direction: 0 }], label: 'Wind' } },
  { id: 'single', props: { data: [{ at: 2, speed: 10, direction: 45 }], label: 'Single' } },
  { id: 'empty', props: { data: [], label: 'Empty' } },
  { id: 'custom-size', props: { data: [{ at: 0, speed: 25, direction: 120 }], size: 48, label: 'Sized', width: 700 } },
  { id: 'custom-attrs', props: { data: [{ at: 1, speed: 8, direction: 200 }], label: 'Custom', class: 'consumer', style: 'color: red', 'data-bench': 'windBarbChart' } },
] satisfies Fixture[];
