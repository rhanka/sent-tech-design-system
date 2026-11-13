import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { data: [{ from: 'a', to: 'b', weight: 3 }, { from: 'b', to: 'c', weight: 2 }, { from: 'a', to: 'c', weight: 1 }], label: 'Deps' } },
  { id: 'with-labels', props: { data: [{ from: 'a', to: 'b', weight: 3 }], labels: { a: 'Alpha', b: 'Beta' }, label: 'Deps', width: 500, height: 300, class: 'consumer', style: 'color: red', 'data-bench': 'chart' } },
  { id: 'self-loop', props: { data: [{ from: 'a', to: 'a', weight: 2 }, { from: 'a', to: 'b', weight: 1 }], label: 'Deps' } },
  { id: 'zero-weight', props: { data: [{ from: 'a', to: 'b', weight: 0 }, { from: 'b', to: 'c', weight: 5 }], label: 'Deps' } },
  { id: 'many-nodes', props: { data: [{ from: 'n1', to: 'n2', weight: 2 }, { from: 'n2', to: 'n3', weight: 3 }, { from: 'n3', to: 'n4', weight: 1 }, { from: 'n4', to: 'n1', weight: 2 }], label: 'Deps' } },
  { id: 'empty', props: { data: [], label: 'No deps' } },
] satisfies Fixture[];
