import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'jsons', geometry: 'region', label: 'Json map' });
export default [
  { id: 'default', props: base() },
  { id: 'id-labelfield', props: { ...base(), id: 'region', labelField: 'city', value: 'sales' } },
  { id: 'sized', props: { ...base(), width: 600, height: 400 } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'jsons' } },
] satisfies Fixture[];
