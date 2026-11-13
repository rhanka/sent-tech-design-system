import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { data: [{ label: 'Alpha', ranks: [1, 2, 2, 3] }, { label: 'Beta', ranks: [3, 1, 4, 2] }], categories: ['2021', '2022', '2023', '2024'], label: 'Rankings' } },
  { id: 'gaps', props: { data: [{ label: 'Alpha', ranks: [1, null, 2, undefined] }, { label: 'Beta', ranks: [2, 3, null, 1] }], categories: ['Q1', 'Q2', 'Q3', 'Q4'], label: 'Gaps' } },
  { id: 'tones', props: { data: [{ label: 'Alpha', ranks: [2, 1], tone: 'category3' }, { label: 'Beta', ranks: [1, 3], tone: 'category5' }], categories: ['Start', 'End'], label: 'Tones' } },
  { id: 'custom-size', props: { data: [{ label: 'Alpha', ranks: [1, 2] }], categories: ['A', 'B'], label: 'Custom', width: 640, height: 360, class: 'consumer', style: 'color: red', 'data-bench': 'chart' } },
  { id: 'misaligned', props: { data: [{ label: 'Alpha', ranks: [1, 2, 3, 4, 5] }, { label: 'Beta', ranks: [2] }], categories: ['A', 'B', 'C'], label: 'Skewed' } },
  { id: 'empty', props: { data: [], categories: [], label: 'None' } },
] satisfies Fixture[];
