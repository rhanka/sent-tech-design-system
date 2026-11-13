import { model } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ model });
export default [
  { id: 'default', props: base() },
  { id: 'dimensions-only', props: { ...base(), includeMeasures: false } },
  { id: 'measures-only', props: { ...base(), includeDimensions: false } },
  { id: 'selected', props: { ...base(), selectedId: 'sales' } },
  { id: 'interactive', props: { ...base(), onSelect: () => {}, selectedId: 'region' } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'fields' } },
] satisfies Fixture[];
