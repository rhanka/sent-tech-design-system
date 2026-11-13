import type { Fixture } from './types.js';
const cloud = [
  { x: 1, y: 1 }, { x: 1.2, y: 1.1, weight: 2 }, { x: 1.1, y: 1.4 },
  { x: 5, y: 5 }, { x: 5.2, y: 4.8, weight: 3 }, { x: 4.8, y: 5.3 },
  { x: 9, y: 2 }, { x: 9.1, y: 2.2 },
];
export default [
  { id: 'default', props: { data: cloud, label: 'Density' } },
  { id: 'categorical-few-bins', props: { data: cloud, label: 'Density', scale: 'categorical', bins: 4, width: 480, height: 240, class: 'consumer', style: 'color: red', 'data-bench': 'chart' } },
  { id: 'no-label', props: { data: cloud } },
  { id: 'size-prop', props: { data: cloud, label: 'Density', size: 500 } },
  { id: 'single-point', props: { data: [{ x: 3, y: 3 }], label: 'Single' } },
  { id: 'empty', props: { data: [], label: 'No density' } },
] satisfies Fixture[];
