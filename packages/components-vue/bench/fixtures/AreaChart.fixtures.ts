import type { Fixture } from './types.js';
const data = [{ x: 0, y: 10 }, { x: 1, y: 20 }, { x: 2, y: 15 }, { x: 3, y: 30 }];
export default [
  { id: 'default', props: { data, label: 'Traffic' } },
  { id: 'smooth-formatted', props: { data, label: 'Traffic', tone: 'category3', smooth: true, width: 640, height: 320, dataLabels: { position: 'inside', format: (n: number) => `$${n}` }, class: 'consumer', style: 'color: red', 'data-bench': 'chart' } },
  { id: 'ordinal-categories', props: { data: [{ x: 'Jan', y: 10 }, { x: 'Feb', y: 25 }, { x: 'Mar', y: 18 }], label: 'Monthly' } },
  { id: 'annotations', props: { data, label: 'Traffic', annotations: [{ kind: 'point', x: 1, y: 20, label: 'Peak' }, { kind: 'region', axis: 'y', from: 5, to: 15, label: 'Band' }, { kind: 'line', axis: 'y', value: 25, label: 'Target' }, { kind: 'label', x: 2, y: 27, text: 'Note', anchor: 'middle' }] } },
  { id: 'interaction', props: { data, label: 'Traffic', hoverKey: '1', onHoverKeyChange: (_key: string | null) => {}, keyboardNav: true, onSelectKey: (_key: string | null) => {} } },
  { id: 'bare-numbers', props: { data: [10, 20, 5, 30], label: 'Bare' } },
  { id: 'single-point', props: { data: [{ x: 2, y: 42 }], label: 'Solo' } },
  { id: 'empty', props: { data: [], label: 'No data' } },
] satisfies Fixture[];
