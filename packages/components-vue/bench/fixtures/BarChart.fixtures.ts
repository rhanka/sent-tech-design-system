import type { Fixture } from './types.js';
const data = [{ label: 'Alpha', value: 10, tone: 'category2' }, { label: 'Beta', value: 25 }, { label: 'Gamma', value: 5, tone: 'category8' }];
export default [
  { id: 'default', props: { data, label: 'Sales' } },
  { id: 'horizontal-labels', props: { data, label: 'Sales', orientation: 'horizontal', width: 640, height: 320, dataLabels: { position: 'inside', format: (n: number) => `$${n}` }, class: 'consumer', style: 'color: red', 'data-bench': 'chart' } },
  { id: 'negative-fixed-domain', props: { data: [{ label: 'Loss', value: -5 }, { label: 'Gain', value: 10 }], label: 'Balance', domain: [-10, 20], invertAxis: true, dataLabels: true } },
  { id: 'selection-keyboard-hover', props: { data, label: 'Sales', selectedKeys: ['Beta'], onSelect: (_key: string) => {}, keyboardNav: true, onSelectKey: (_key: string | null) => {}, hoverKey: 'Alpha' } },
  { id: 'log-scale', props: { data: [{ label: 'Zero', value: 0 }, { label: 'Ten', value: 10 }, { label: 'Thousand', value: 1000 }], label: 'Logarithms', scale: 'log', domain: [1, 1000], invertAxis: true } },
  { id: 'overlays-errors', props: { data: [{ label: 'Alpha', value: 10, errorLow: 8, errorHigh: 14 }, { label: 'Beta', value: 20 }], label: 'Forecast', referenceLines: [{ value: 12, label: 'Reference' }], bands: [{ from: 3, to: 6, label: 'Band' }], goalLine: { value: 18, label: 'Goal' }, annotations: [{ kind: 'point', x: 'Alpha', y: 10, label: 'Point' }, { kind: 'region', axis: 'y', from: 5, to: 8, label: 'Region' }] } },
  { id: 'empty', props: { data: [], label: 'No data', hoverKey: null } },
  { id: 'horizontal-overlays', props: { data, label: 'Horizontal', orientation: 'horizontal', referenceLines: [{ axis: 'x', value: 15, label: 'Target' }], goalLine: { value: 20 }, showLegend: false } },
] satisfies Fixture[];
