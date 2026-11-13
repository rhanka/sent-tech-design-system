import type { Fixture } from './types.js';
const cats = ['Q1', 'Q2', 'Q3'];
export default [
  { id: 'default', props: { categories: cats, bars: [{ label: 'Bars', data: [3, 6, 4] }], lines: [{ label: 'Line', data: [4, 5, 7] }], label: 'Combo' } },
  { id: 'axes-legend', props: { categories: cats, bars: [{ label: 'Bars', data: [3, 6, 4], tone: 'category2' }], label: 'Combo', leftAxisLabel: 'Count', rightAxisLabel: 'Index', width: 640, height: 320, class: 'consumer', style: 'color: red', 'data-bench': 'chart' } },
  { id: 'smooth-datalabels', props: { categories: cats, bars: [{ label: 'Bars', data: [2, 5, 3] }], lines: [{ label: 'Line', data: [3, 4, 6], smooth: true, tone: 'category3' }], label: 'Combo', dataLabels: true, legend: false } },
  { id: 'hidden-series', props: { categories: cats, bars: [{ label: 'Bars', data: [3, 6, 4] }, { label: 'Other', data: [9, 9, 9] }], lines: [{ label: 'Line', data: [4, 5, 7] }], label: 'Combo', hiddenSeries: ['Other'], onToggleSeries: (_id: string) => {} } },
  { id: 'annotations-nav', props: { categories: cats, bars: [{ label: 'Bars', data: [3, 6, 4] }], lines: [{ label: 'Line', data: [4, 5, 7] }], label: 'Combo', annotations: [{ kind: 'point', x: 'Q2', y: 5, label: 'Peak' }, { kind: 'region', axis: 'y', from: 2, to: 4, label: 'Band' }], keyboardNav: true, onSelectKey: (_key: string | null) => {}, hoverKey: 'Q1' } },
  { id: 'empty', props: { categories: [], label: 'Empty combo' } },
] satisfies Fixture[];
