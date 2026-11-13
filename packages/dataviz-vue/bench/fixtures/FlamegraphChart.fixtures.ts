import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'flames', id: 'city', parentId: 'region', name: 'city', value: 'sales', label: 'Flames' });
export default [
  { id: 'default', props: base() },
  { id: 'sized', props: { ...base(), width: 560, height: 360, size: 18 } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'flames' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
