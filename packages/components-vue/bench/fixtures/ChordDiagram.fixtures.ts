import type { Fixture } from './types.js';
const flows = [
  { from: 'a', to: 'b', value: 12 },
  { from: 'b', to: 'c', value: 8 },
  { from: 'a', to: 'c', value: 5 },
  { from: 'c', to: 'd', value: 20 },
  { from: 'a', to: 'd', value: 3 },
];
export default [
  { id: 'default', props: { data: flows, labels: { a: 'Alpha', b: 'Beta', c: 'Gamma', d: 'Delta' }, label: 'Flows' } },
  { id: 'raw', props: { data: flows, label: 'Raw' } },
  { id: 'custom-size', props: { data: flows, label: 'Custom', width: 480, height: 480, class: 'consumer', style: 'color: red', 'data-bench': 'chart' } },
  { id: 'filtered', props: { data: [{ from: 'a', to: 'b', value: 0 }, { from: 'b', to: 'c', value: -4 }, { from: 'a', to: 'c', value: 6 }], label: 'Filtered' } },
  { id: 'self', props: { data: [{ from: 'a', to: 'a', value: 4 }, { from: 'a', to: 'b', value: 2 }], label: 'Self' } },
  { id: 'empty', props: { data: [], label: 'No flows' } },
] satisfies Fixture[];
