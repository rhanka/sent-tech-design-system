import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { value: 1234.5, label: 'Revenue' } },
  { id: 'delta-up', props: { value: 42, label: 'Sales', delta: 0.12 } },
  { id: 'currency-unit', props: { value: 9999, label: 'Budget', format: 'currency', unit: 'EUR', delta: 250, deltaFormat: 'absolute', trend: 'down' } },
  { id: 'sparkline', props: { value: 0.42, label: 'Fill rate', format: 'percent', sparkline: [1, 3, 2, 4, 5], size: 'lg', tone: 'category3' } },
  { id: 'decoration', props: { value: 'Long text', label: 'Status', decoration: { intent: 'positive', icon: 'trending-up' } } },
  { id: 'custom-attrs', props: { value: 7, label: 'Score', class: 'consumer', style: 'color: red', 'data-bench': 'kpi' } },
] satisfies Fixture[];
