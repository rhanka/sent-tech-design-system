import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'forecast', x: 'city', y: 'sales', periods: 3, label: 'Forecast' });
export default [
  { id: 'default', props: base() },
  { id: 'step', props: { ...base(), step: 2 } },
  { id: 'sized', props: { ...base(), width: 480, height: 260 } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'forecast' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
