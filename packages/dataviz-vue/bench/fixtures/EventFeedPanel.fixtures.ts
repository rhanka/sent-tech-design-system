import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'feed', at: 'city', type: 'region', severity: 'sales', message: 'sales', label: 'Events' });
export default [
  { id: 'default', props: base() },
  { id: 'sized', props: { ...base(), maxHeight: 320, height: 240 } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'feed' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
