import type { Fixture } from './types.js';
const week = [
  { date: '2024-03-04', value: 3 }, { date: '2024-03-05', value: 7 }, { date: '2024-03-06', value: 12 },
  { date: '2024-03-07', value: 5 }, { date: '2024-03-08', value: 18 }, { date: '2024-03-09', value: 9 },
  { date: '2024-03-10', value: 14 }, { date: '2024-03-11', value: 6 }, { date: '2024-03-12', value: 21 },
  { date: '2024-03-13', value: 11 }, { date: '2024-03-14', value: 4 }, { date: '2024-03-15', value: 25 },
];
export default [
  { id: 'default', props: { data: week, label: 'Activity' } },
  { id: 'categorical', props: { data: week, label: 'Activity', scale: 'categorical' } },
  { id: 'custom-size', props: { data: week, label: 'Activity', width: 640, height: 200, class: 'consumer', style: 'color: red', 'data-bench': 'chart' } },
  { id: 'invalid-dates', props: { data: [{ date: '2024-13-40', value: 5 }, { date: 'bogus', value: 8 }, { date: '2024-03-05', value: 7 }], label: 'Noisy' } },
  { id: 'month-span', props: { data: [{ date: '2024-01-30', value: 2 }, { date: '2024-01-31', value: 9 }, { date: '2024-02-01', value: 4 }, { date: '2024-02-02', value: 15 }], label: 'Turn' } },
  { id: 'empty', props: { data: [], label: 'No data' } },
] satisfies Fixture[];
