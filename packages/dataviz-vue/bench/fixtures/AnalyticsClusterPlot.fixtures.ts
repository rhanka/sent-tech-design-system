import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'clusters', fields: ['sales'], k: 2, label: 'Sales clusters' });
const filtered = newStore(); filtered.setFilter('region', { kind: 'include', values: ['North'] });
export default [
  { id: 'default', props: base() },
  { id: 'iterations-size', props: { ...base(), maxIterations: 20, width: 480, height: 300 } },
  { id: 'filtered', props: { ...base(), store: filtered } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'clusters' } },
  { id: 'single-cluster', props: { ...base(), k: 1 } },
  { id: 'three-clusters', props: { ...base(), k: 3 } },
] satisfies Fixture[];
