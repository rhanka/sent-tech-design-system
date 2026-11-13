import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'heikin', label_field: 'city', open: 'sales', high: 'sales', low: 'sales', close: 'sales', label: 'Heikin Ashi' });
export default [
  { id: 'default', props: base() },
  { id: 'sized', props: { ...base(), width: 560, height: 300 } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'heikin' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
