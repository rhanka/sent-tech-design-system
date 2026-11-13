import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'arcs', source: 'region', target: 'city', weight: 'sales', label: 'Arcs' });
export default [
  { id: 'default', props: base() },
  { id: 'labels', props: { ...base(), labels: { North: 'N', South: 'S' } } },
  { id: 'sized', props: { ...base(), width: 560, height: 300 } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'arcs' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
