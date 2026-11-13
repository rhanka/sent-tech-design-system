import type { Fixture } from './types.js';
const data = [{ x: 20, y: 80, label: 'Quick' }, { x: 80, y: 90, label: 'Major' }, { x: 10, y: 10, label: 'Wait' }];
export default [
  { id: 'default', props: { data, label: 'Matrice' } },
  { id: 'tones', props: { data: [{ x: 30, y: 70, label: 'A', tone: 'category2' }, { x: 60, y: 60, label: 'B' }], label: 'Matrice', width: 480, height: 320 } },
  { id: 'thresholds', props: { data, label: 'Matrice', title: 'Prio', xThreshold: 30, yThreshold: 60, radius: 4, class: 'consumer', style: 'color: red', 'data-bench': 'matrix' } },
  { id: 'empty', props: { data: [], label: 'No data' } },
] satisfies Fixture[];
