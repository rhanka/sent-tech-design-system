import type { Fixture } from './types.js';
const data = [
  { label: 'Mon', open: 100, high: 110, low: 95, close: 105 },
  { label: 'Tue', open: 105, high: 108, low: 92, close: 94 },
  { label: 'Wed', open: 94, high: 115, low: 90, close: 112 },
  { label: 'Thu', open: 112, high: 120, low: 108, close: 118 },
];
export default [
  { id: 'default', props: { data, label: 'Prices' } },
  { id: 'data-labels', props: { data, label: 'Prices', dataLabels: { format: (n: number) => `$${n}` } } },
  { id: 'annotations', props: { data, label: 'Prices', annotations: [{ kind: 'point', x: 'Wed', y: 112, label: 'Surge' }, { kind: 'region', axis: 'y', from: 95, to: 100, label: 'Band' }, { kind: 'line', axis: 'y', value: 105, label: 'Level' }] } },
  { id: 'interaction', props: { data, label: 'Prices', hoverKey: 'Wed', onHoverKeyChange: (_key: string | null) => {}, keyboardNav: true, onSelectKey: (_key: string | null) => {} } },
  { id: 'custom-size', props: { data, label: 'Prices', width: 640, height: 320, class: 'consumer', style: 'color: red', 'data-bench': 'chart' } },
  { id: 'clamped', props: { data: [{ label: 'Odd', open: 100, high: 90, low: 110, close: 95 }], label: 'Clamped' } },
  { id: 'empty', props: { data: [], label: 'No data' } },
] satisfies Fixture[];
