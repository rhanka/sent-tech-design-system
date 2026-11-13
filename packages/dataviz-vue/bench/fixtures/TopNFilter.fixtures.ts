import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), dimension: 'region', measure: 'sales' });
export default [
  { id: 'default', props: base() },
  { id: 'n5-label', props: { ...base(), defaultN: 5, label: 'Top regions' } },
  { id: 'n1', props: { ...base(), defaultN: 1 } },
  { id: 'city', props: { ...base(), dimension: 'city' } },
  { id: 'attrs', props: { ...base(), class: 'consumer', 'data-bench': 'topn', style: 'color:red' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
