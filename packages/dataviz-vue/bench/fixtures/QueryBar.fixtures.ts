import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), dimension: 'region' });
export default [
  { id: 'default', props: base() },
  { id: 'fields', props: { ...base(), fields: ['region', 'city'] } },
  { id: 'matching', props: { ...base(), minLength: 3, caseSensitive: true } },
  { id: 'labels', props: { ...base(), label: 'Filter regions', placeholder: 'Search…', clearLabel: 'Clear', size: 'sm' } },
  { id: 'attrs', props: { ...base(), class: 'consumer', 'data-bench': 'query', style: 'color:red' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
