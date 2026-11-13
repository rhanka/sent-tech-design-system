import type { Fixture } from './types.js';
const links = [
  { from: 'alpha', to: 'beta', weight: 4 },
  { from: 'beta', to: 'gamma', weight: 7 },
  { from: 'alpha', to: 'gamma', weight: 2 },
  { from: 'gamma', to: 'delta', weight: 9 },
];
export default [
  { id: 'default', props: { data: links, labels: { alpha: 'Alpha', beta: 'Beta', gamma: 'Gamma', delta: 'Delta' }, label: 'Link weights' } },
  { id: 'raw-labels', props: { data: links, label: 'Raw ids' } },
  { id: 'custom-size', props: { data: links, label: 'Custom', width: 640, height: 320, class: 'consumer', style: 'color: red', 'data-bench': 'chart' } },
  { id: 'filtered-weights', props: { data: [{ from: 'alpha', to: 'beta', weight: 0 }, { from: 'beta', to: 'gamma', weight: -3 }, { from: 'alpha', to: 'gamma', weight: 5 }], label: 'Filtered' } },
  { id: 'self-link', props: { data: [{ from: 'solo', to: 'solo', weight: 3 }], label: 'Self link' } },
  { id: 'empty', props: { data: [], label: 'No links' } },
] satisfies Fixture[];
