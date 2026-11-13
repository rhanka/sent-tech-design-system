import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'bars', dimension: 'region', measure: 'sales', label: 'Sales' });
const selected = newStore(); selected.toggleSelection('bars', 'North');
const filtered = newStore(); filtered.setFilter('region', { kind: 'include', values: ['South'] });
export default [
  { id: 'default', props: base() },
  { id: 'horizontal-attrs', props: { ...base(), orientation: 'horizontal', width: 480, height: 240, tone: 'category3', domain: [-10, 40], class: 'consumer', 'data-bench': 'bars', style: 'color:red' } },
  { id: 'selected-hover', props: { ...base(), store: selected, hoverKey: 'North', onHoverKeyChange: () => {}, onSelectKey: () => {} } },
  { id: 'filtered', props: { ...base(), store: filtered } },
  { id: 'output-only', props: { ...base(), store: selected, selectable: false, hoverKey: null } },
  { id: 'invalid-fields', props: { ...base(), dimension: 'missing', measure: 'missing' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
