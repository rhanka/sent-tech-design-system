import type { Fixture } from './types.js';
const data = [{ label: 'Mon', open: 10, high: 14, low: 8, close: 12 }, { label: 'Tue', open: 12, high: 15, low: 11, close: 11 }, { label: 'Wed', open: 11, high: 13, low: 9, close: 13 }];
export default [
  { id: 'default', props: { data, label: 'Prices' } },
  { id: 'hover', props: { data, label: 'Prices', hoverKey: 'Tue', width: 640, height: 320 } },
  { id: 'annotations', props: { data, label: 'Prices', annotations: [{ kind: 'line', x: 'Tue', y: 12, label: 'Note' }, { kind: 'region', axis: 'y', from: 9, to: 11, label: 'Band' }] } },
  { id: 'datalabels', props: { data, label: 'Prices', dataLabels: true } },
  { id: 'keyboard-nav', props: { data, label: 'Prices', keyboardNav: true, onSelectKey: (_key: string | null) => {}, class: 'consumer', style: 'color: red', 'data-bench': 'ohlc' } },
  { id: 'empty', props: { data: [], label: 'No data' } },
] satisfies Fixture[];
