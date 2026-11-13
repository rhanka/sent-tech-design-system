import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { data: [{ label: 'A', col: 0, row: 0, value: 10 }, { label: 'B', col: 1, row: 0, value: 20 }], label: 'Grid' } },
  { id: 'large-grid', props: { data: [{ label: 'A', col: 0, row: 0, value: 5 }, { label: 'B', col: 1, row: 0, value: 15 }, { label: 'C', col: 0, row: 1, value: 25 }, { label: 'D', col: 1, row: 1, value: 35 }], width: 600, height: 400, label: 'Map' } },
  { id: 'invalid-filtered', props: { data: [{ label: 'Bad', col: 0, row: 0, value: Number.NaN }, { label: 'Good', col: 1, row: 1, value: 7.5 }], label: 'Filtered' } },
  { id: 'empty', props: { data: [], label: 'Empty' } },
  { id: 'custom-attrs', props: { data: [{ label: 'A', col: 0, row: 0, value: 3 }], label: 'Custom', class: 'consumer', style: 'color: red', 'data-bench': 'tileMapChart' } },
] satisfies Fixture[];
