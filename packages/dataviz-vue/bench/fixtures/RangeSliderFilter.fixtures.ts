import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), dimension: 'sales' });
export default [
  { id: 'default', props: base() },
  { id: 'bounds', props: { ...base(), min: 0, max: 20, step: 5 } },
  { id: 'label', props: { ...base(), label: 'Sales range' } },
  { id: 'min-only', props: { ...base(), min: -10 } },
  { id: 'attrs', props: { ...base(), class: 'consumer', 'data-bench': 'range' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
