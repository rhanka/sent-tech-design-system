import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'density', x: 'sales', y: 'sales', label: 'Density' });
export default [
  { id: 'default', props: base() },
  { id: 'bins-weight', props: { ...base(), weight: 'sales', bins: 5 } },
  { id: 'sized', props: { ...base(), width: 480, height: 360, size: 16 } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'density' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
