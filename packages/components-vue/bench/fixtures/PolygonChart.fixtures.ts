import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { data: [{ x: 0, y: 0 }, { x: 10, y: 20 }, { x: 30, y: 10 }], label: 'Shape' } },
  { id: 'tone', props: { data: [{ x: 5, y: 5 }, { x: 15, y: 25 }, { x: 35, y: 15 }], tone: 'category3', label: 'Shape', width: 640, height: 360 } },
  { id: 'nan-filtered', props: { data: [{ x: 0, y: 0 }, { x: NaN, y: 5 }, { x: 20, y: 10 }], label: 'Bad', class: 'consumer', style: 'color: red', 'data-bench': 'polygon' } },
  { id: 'single', props: { data: [{ x: 1, y: 1 }], label: 'One' } },
] satisfies Fixture[];
