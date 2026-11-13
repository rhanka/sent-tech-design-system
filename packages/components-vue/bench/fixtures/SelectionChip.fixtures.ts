import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { label: 'Filter' } },
  { id: 'count-success', props: { label: 'Active', count: 3, tone: 'success' } },
  { id: 'clearable-error', props: { label: 'Removable', count: 12, tone: 'error', onClear: () => {} } },
  { id: 'disabled-info', props: { label: 'Disabled', tone: 'info', disabled: true, onClear: () => {} } },
  { id: 'custom', props: { label: 'Custom', tone: 'warning', class: 'consumer', style: 'color: red', 'data-bench': 'chip' } },
  { id: 'zero-count', props: { label: 'Zero', count: 0 } },
] satisfies Fixture[];
