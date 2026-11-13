import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), value: 'sales', group: 'region', label: 'Sales boxes' });
export default [
  { id: 'default', props: base() },
  { id: 'no-group', props: { store: newStore(), value: 'sales', label: 'Sales boxes' } },
  { id: 'sized', props: { ...base(), width: 520, height: 280 } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'boxes' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
