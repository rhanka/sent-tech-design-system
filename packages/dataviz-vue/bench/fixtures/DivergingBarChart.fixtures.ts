import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'diverge', category: 'city', measure: 'sales', label: 'Diverging' });
export default [
  { id: 'default', props: base() },
  { id: 'domain', props: { ...base(), domain: [-30, 30] } },
  { id: 'no-legend', props: { ...base(), showLegend: false } },
  { id: 'sized', props: { ...base(), width: 520, height: 280 } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'diverge' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
