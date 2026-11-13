import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'drill', hierarchy: ['region', 'city'], measure: 'sales', label: 'Drill sales' });
const drilled = newStore(); drilled.setFilter('region', { kind: 'include', values: ['North'] }); drilled.drillDown('drill', 'city'); drilled.toggleSelection('drill', 'A');
export default [
  { id: 'default', props: base() },
  { id: 'horizontal-attrs', props: { ...base(), orientation: 'horizontal', width: 480, height: 240, tone: 'category2', class: 'consumer', 'data-bench': 'drill' } },
  { id: 'drilled-selected', props: { ...base(), store: drilled } },
  { id: 'empty-hierarchy', props: { ...base(), hierarchy: [] } },
  { id: 'invalid-measure', props: { ...base(), measure: 'missing' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
