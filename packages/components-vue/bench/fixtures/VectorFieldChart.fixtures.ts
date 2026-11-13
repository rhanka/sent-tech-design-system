import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { data: [{ x: 0, y: 0, length: 5, direction: 0 }, { x: 1, y: 1, length: 10, direction: 90 }, { x: 2, y: 0, length: 3, direction: 180 }, { x: 1, y: 2, length: 7, direction: 270 }], label: 'Field' } },
  { id: 'single', props: { data: [{ x: 3, y: 4, length: 2, direction: 45 }], label: 'Single' } },
  { id: 'empty', props: { data: [], label: 'Empty' } },
  { id: 'custom-size', props: { data: [{ x: 0, y: 0, length: 4, direction: 30 }, { x: 5, y: 5, length: 1, direction: 200 }], size: 40, label: 'Sized', width: 700, height: 400 } },
  { id: 'custom-attrs', props: { data: [{ x: 1, y: 1, length: 6, direction: 90 }], label: 'Custom', class: 'consumer', style: 'color: red', 'data-bench': 'vectorFieldChart' } },
] satisfies Fixture[];
