import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'swim', job: 'city', at: 'region', score: 'sales', label: 'Anomalies' });
export default [
  { id: 'default', props: base() },
  { id: 'with-max', props: { ...base(), max: 20 } },
  { id: 'sized', props: { ...base(), width: 480, height: 260, size: 14 } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'swim' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
