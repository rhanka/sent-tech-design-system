import type { Fixture } from './types.js';
const grid = [
  { x: 0, y: 0, value: 1 }, { x: 1, y: 0, value: 3 }, { x: 2, y: 0, value: 2 },
  { x: 0, y: 1, value: 4 }, { x: 1, y: 1, value: 8 }, { x: 2, y: 1, value: 5 },
  { x: 0, y: 2, value: 2 }, { x: 1, y: 2, value: 6 }, { x: 2, y: 2, value: 9 },
];
export default [
  { id: 'default', props: { data: grid, label: 'Density' } },
  { id: 'categorical-few-levels', props: { data: grid, label: 'Density', scale: 'categorical', levels: 3, width: 480, height: 240, class: 'consumer', style: 'color: red', 'data-bench': 'chart' } },
  { id: 'no-label', props: { data: grid } },
  { id: 'many-levels', props: { data: grid, label: 'Density', levels: 12 } },
  { id: 'sparse-invalid', props: { data: [{ x: 1, y: 1, value: 5 }, { x: NaN, y: 0, value: 2 }, { x: 2, y: 2, value: 7 }], label: 'Density' } },
  { id: 'empty', props: { data: [], label: 'No contour' } },
] satisfies Fixture[];
