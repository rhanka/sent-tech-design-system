import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { data: [{ category: 'Alpha', period: '2023', value: 10 }, { category: 'Beta', period: '2023', value: 20 }, { category: 'Alpha', period: '2024', value: 15 }, { category: 'Beta', period: '2024', value: 12 }], label: 'Ribbon' } },
  { id: 'tones-custom', props: { data: [{ category: 'Sales', period: 1, value: 5, tone: 'category3' }, { category: 'Sales', period: 2, value: 8, tone: 'category3' }], label: 'Tones', width: 600, height: 280, class: 'consumer', style: 'color: red', 'data-bench': 'ribbon' } },
  { id: 'empty', props: { data: [], label: 'Empty' } },
  { id: 'single-period', props: { data: [{ category: 'Only', period: 'Q1', value: 10 }], label: 'Single' } },
  { id: 'invalid', props: { data: [{ category: '', period: 'Q1', value: 10 }, { category: 'Neg', period: 'Q1', value: -5 }, { category: 'Bad', period: 'Q1', value: Number.NaN }], label: 'Invalid' } },
  { id: 'size-override', props: { data: [{ category: 'A', period: 'P1', value: 3 }, { category: 'B', period: 'P1', value: 7 }, { category: 'A', period: 'P2', value: 6 }, { category: 'B', period: 'P2', value: 4 }], label: 'Sized', size: 400 } },
] satisfies Fixture[];
