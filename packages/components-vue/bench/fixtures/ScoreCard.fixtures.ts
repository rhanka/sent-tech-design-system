import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { title: 'Performance', score: 4.2, stars: 4 } },
  { id: 'complexity-large', props: { title: 'Complexity', score: 3.7, stars: 4, max: 5, type: 'complexity', unit: 'points', size: 'lg' } },
  { id: 'small-zero', props: { title: 'Empty', score: 0.5, stars: 0, size: 'sm' } },
  { id: 'full', props: { title: 'Perfect', score: 5.0, stars: 5 } },
  { id: 'overflow', props: { title: 'Over', score: 9.9, stars: 12, max: 5, class: 'consumer', style: 'color: red', 'data-bench': 'score' } },
  { id: 'custom-unit', props: { title: 'Rated', score: 2.5, stars: 2, unit: 'stars' } },
] satisfies Fixture[];
