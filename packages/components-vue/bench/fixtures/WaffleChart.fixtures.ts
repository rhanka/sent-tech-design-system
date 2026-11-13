import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { data: [{ label: 'Yes', value: 60, tone: 'success' }, { label: 'No', value: 40 }], label: 'Answers' } },
  { id: 'single', props: { data: [{ label: 'All', value: 5 }], label: 'Single' } },
  { id: 'empty', props: { data: [], label: 'Empty' } },
  { id: 'custom-grid', props: { data: [{ label: 'A', value: 3 }, { label: 'B', value: 2 }, { label: 'C', value: 1 }], totalCells: 50, columns: 5, label: 'Grid' } },
  { id: 'custom-attrs', props: { data: [{ label: 'A', value: 1 }], label: 'Custom', class: 'consumer', style: 'color: red', 'data-bench': 'waffleChart' } },
] satisfies Fixture[];
