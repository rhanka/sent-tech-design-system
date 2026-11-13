import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { month: '2024-03' } },
  { id: 'selected', props: { month: '2024-03', value: '2024-03-15' } },
  { id: 'range', props: { month: '2024-03', range: true, value: ['2024-03-10', '2024-03-20'] } },
  { id: 'bounds', props: { month: '2024-03', min: '2024-03-10', max: '2024-03-20', value: '2024-03-15' } },
  { id: 'sunday-start-en', props: { month: '2024-06', weekStartsOn: 0, locale: 'en-US', value: '2024-06-03' } },
  { id: 'custom', props: { month: '2024-01', previousMonthLabel: 'Back', nextMonthLabel: 'Forward', class: 'consumer', style: 'color: red', 'data-bench': 'cal' } },
] satisfies Fixture[];
