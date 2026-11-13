import { model } from './store.js';
import type { Fixture } from './types.js';
const onChange = () => {};
const base = () => ({ model, value: { id: 'sales_x2', label: 'Sales x2', expression: 'sales', kind: 'measure' as const }, onChange });
export default [
  { id: 'default', props: base() },
  { id: 'dimension', props: { ...base(), value: { id: 'region_label', label: 'Region label', expression: 'region', kind: 'dimension' as const } } },
  { id: 'aggregation', props: { ...base(), value: { id: 'avg_sales', label: 'Avg sales', expression: 'sales', kind: 'measure' as const, aggregation: 'avg' as const } } },
  { id: 'variables', props: { ...base(), variables: [{ value: 'sales', label: 'Sales' }] } },
  { id: 'custom-label', props: { ...base(), label: 'Editor', class: 'consumer', 'data-bench': 'calc' } },
] satisfies Fixture[];
