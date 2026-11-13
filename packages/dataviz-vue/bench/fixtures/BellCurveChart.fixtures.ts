import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'bell', measure: 'sales', label: 'Bell sales' });
export default [
  { id: 'default', props: base() },
  { id: 'tone-smooth', props: { ...base(), tone: 'category4', smooth: false } },
  { id: 'intervals', props: { ...base(), intervals: 10 } },
  { id: 'sized', props: { ...base(), width: 480, height: 260 } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'bell' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
