import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'choros', region: 'region', measure: 'sales', label: 'Choropleth' });
export default [
  { id: 'default', props: base() },
  { id: 'geometry', props: { ...base(), geometry: 'region' } },
  { id: 'sized', props: { ...base(), width: 600, height: 320 } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'choros' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
