import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'areas', category: 'city', measure: 'sales', label: 'Sales area' });
export default [
  { id: 'default', props: base() },
  { id: 'tone-smooth', props: { ...base(), tone: 'category2', smooth: true } },
  { id: 'sized', props: { ...base(), width: 520, height: 280 } },
  { id: 'annotations-datalabels', props: { ...base(), annotations: [{ key: 'B', label: 'Peak' }], dataLabels: true } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'areas' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
