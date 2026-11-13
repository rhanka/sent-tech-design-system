import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { data: [{ category: 'P1', values: [{ label: 'A', value: 10 }, { label: 'B', value: 5 }] }, { category: 'P2', values: [{ label: 'A', value: 12 }, { label: 'B', value: 8 }] }], label: 'Stream' } },
  { id: 'linear-nolegend', props: { data: [{ category: 'X', values: [{ label: 'S', value: 3, tone: 'category3' }] }], label: 'Stream', smooth: false, showLegend: false, width: 400, height: 300, class: 'consumer', style: 'color: red', 'data-bench': 'stream' } },
  { id: 'empty', props: { data: [], label: 'Empty' } },
  { id: 'single', props: { data: [{ category: 'Only', values: [{ label: 'One', value: 7 }] }], label: 'Single' } },
] satisfies Fixture[];
