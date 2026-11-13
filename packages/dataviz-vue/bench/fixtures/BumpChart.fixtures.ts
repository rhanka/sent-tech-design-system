import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'bumps', series: 'region', category: 'city', measure: 'sales', label: 'Bumps' });
export default [
  { id: 'default', props: base() },
  { id: 'asc', props: { ...base(), direction: 'asc' } },
  { id: 'sized', props: { ...base(), width: 560, height: 300 } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'bumps' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
