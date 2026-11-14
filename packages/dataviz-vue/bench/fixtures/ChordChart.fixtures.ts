import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'chords', source: 'region', target: 'city', measure: 'sales', label: 'Chords' });
export default [
  { id: 'default', props: base() },
  { id: 'sized', props: { ...base(), width: 560, height: 420 } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'chords' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
