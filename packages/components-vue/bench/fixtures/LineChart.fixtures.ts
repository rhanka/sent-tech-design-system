import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { data: [{ x: 1, y: 2 }, { x: 2, y: 5 }, { x: 3, y: 4 }], label: 'Series' } },
  { id: 'ordinal-smooth-area', props: { data: [{ x: 'Jan', y: 10 }, { x: 'Feb', y: 15 }, { x: 'Mar', y: 12 }], label: 'Months', smooth: true, area: true, tone: 'category2', width: 640, height: 300, class: 'consumer', style: 'color: red', 'data-bench': 'line' } },
  { id: 'forecast', props: { data: [{ x: 1, y: 10 }, { x: 2, y: 12 }, { x: 3, y: 14, forecast: true }], label: 'Forecast' } },
  { id: 'overlays', props: { data: [{ x: 1, y: 10 }, { x: 2, y: 20 }, { x: 3, y: 15 }], label: 'Overlays', bands: [{ from: 5, to: 12, label: 'Band' }], referenceLines: [{ value: 18, label: 'Ref' }], goalLine: { value: 22, label: 'Goal' } } },
  { id: 'trend', props: { data: [{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 }], label: 'Trend', trend: true } },
  { id: 'annotations-labels', props: { data: [{ x: 1, y: 10 }, { x: 2, y: 18 }, { x: 3, y: 14 }], label: 'Annotated', annotations: [{ kind: 'point', x: 2, y: 18, label: 'Peak' }, { kind: 'region', axis: 'y', from: 12, to: 16, label: 'Zone' }], dataLabels: true } },
  { id: 'keyboard', props: { data: [{ x: 1, y: 10 }, { x: 2, y: 20 }], label: 'Nav', keyboardNav: true } },
] satisfies Fixture[];
