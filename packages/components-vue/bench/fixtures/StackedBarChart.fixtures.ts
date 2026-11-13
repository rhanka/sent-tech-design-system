import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { data: [{ label: 'A', segments: [{ label: 'X', value: 10 }, { label: 'Y', value: 20 }] }, { label: 'B', segments: [{ label: 'X', value: 5 }, { label: 'Y', value: 15 }] }], label: 'Stacked' } },
  { id: 'datalabels-legend', props: { data: [{ label: 'A', segments: [{ label: 'Sales', value: 10, tone: 'category3' }] }], label: 'Stacked', dataLabels: true, showLegend: true, width: 400, height: 300, class: 'consumer', style: 'color: red', 'data-bench': 'stacked' } },
  { id: 'hidden-interactive', props: { data: [{ label: 'A', segments: [{ label: 'X', value: 10 }, { label: 'Y', value: 20 }] }], label: 'Stacked', hiddenSeries: ['X'], onToggleSeries: (_id: string) => {} } },
  { id: 'empty', props: { data: [], label: 'Empty' } },
  { id: 'single', props: { data: [{ label: 'Solo', segments: [{ label: 'Only', value: 7 }] }], label: 'Single' } },
] satisfies Fixture[];
