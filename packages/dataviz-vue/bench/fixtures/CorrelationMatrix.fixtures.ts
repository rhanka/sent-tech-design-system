import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), measures: ['sales'], label: 'Correlations' });
export default [
  { id: 'default', props: base() },
  { id: 'no-legend', props: { ...base(), legend: false } },
  { id: 'sized', props: { ...base(), width: 420, height: 420 } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'corr' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
