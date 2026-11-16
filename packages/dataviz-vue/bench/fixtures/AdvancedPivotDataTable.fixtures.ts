import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), rows: ['region', 'city'], measures: ['sales'] });
const styled = newStore();
export default [
  { id: 'default', props: base() },
  { id: 'columns-subtotals', props: { ...base(), columns: ['city'], includeSubtotals: true } },
  { id: 'heatmap-sparkline', props: { ...base(), includeSubtotals: true, heatmap: true, sparklineDimension: 'city' } },
  { id: 'collapsed', props: { ...base(), includeSubtotals: true, collapsedRowPaths: [['North']] } },
  { id: 'caption-size-attrs', props: { ...base(), caption: 'Pivot sales', size: 'lg', class: 'consumer', 'data-bench': 'pivot' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
