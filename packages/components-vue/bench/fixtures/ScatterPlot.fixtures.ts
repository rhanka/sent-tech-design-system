import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { data: [{ x: 1, y: 2, label: 'A' }, { x: 2, y: 5 }, { x: 3, y: 3 }], label: 'Scatter' } },
  { id: 'labels-centroids', props: { data: [{ x: 1, y: 1 }, { x: 5, y: 5, tone: 'category3' }], label: 'Scatter', xLabel: 'Width', yLabel: 'Height', radius: 4, centroids: [{ x: 3, y: 3, label: 'C' }], class: 'consumer', style: 'color: red', 'data-bench': 'scatter' } },
  { id: 'annotations-datalabels', props: { data: [{ x: 1, y: 2 }, { x: 2, y: 4 }], label: 'Scatter', dataLabels: true, annotations: [{ kind: 'point', x: 2, y: 4, label: 'P' }, { kind: 'region', axis: 'x', from: 1, to: 2, label: 'R' }] } },
  { id: 'controlled-nav', props: { data: [{ x: 1, y: 1, label: 'One' }, { x: 2, y: 2, label: 'Two' }], label: 'Scatter', hoverKey: 'One', onHoverKeyChange: (_k: string | null) => {}, keyboardNav: true, onSelectKey: (_k: string | null) => {} } },
  { id: 'custom-size', props: { data: [{ x: 0, y: 0 }, { x: 10, y: 10 }], label: 'Sized', width: 600, height: 400 } },
  { id: 'empty', props: { data: [], label: 'Empty' } },
] satisfies Fixture[];
