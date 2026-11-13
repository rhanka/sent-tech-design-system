import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'forces', source: 'region', target: 'city', label: 'Force graph' });
export default [
  { id: 'default', props: base() },
  { id: 'weighted', props: { ...base(), weight: 'sales' } },
  { id: 'sized', props: { ...base(), width: 560, height: 360 } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'forces' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
