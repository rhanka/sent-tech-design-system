import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'splom', measures: ['sales', 'sales'], label: 'Scatter matrix' });
const filtered = newStore(); filtered.setFilter('region', { kind: 'include', values: ['North'] });
export default [
  { id: 'default', props: base() },
  { id: 'single', props: { ...base(), measures: ['sales'], cellSize: 120 } },
  { id: 'attrs', props: { ...base(), class: 'consumer', 'data-bench': 'splom', style: 'color:red' } },
  { id: 'filtered', props: { ...base(), store: filtered } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
