import { newStore } from './store.js';
import type { Fixture } from './types.js';
const selected = newStore(); selected.toggleSelection('bars', 'North'); selected.toggleSelection('bars', 'South');
const twoViews = newStore(); twoViews.toggleSelection('bars', 'North'); twoViews.toggleSelection('facets', 'South');
export default [
  { id: 'default', props: { store: newStore() } },
  { id: 'selected', props: { store: selected } },
  { id: 'labels', props: { store: twoViews, labels: { bars: 'Bars', facets: 'Facets' }, label: 'Active selections' } },
  { id: 'attrs', props: { store: selected, class: 'consumer', 'data-bench': 'legend', style: 'color:red' } },
] satisfies Fixture[];
