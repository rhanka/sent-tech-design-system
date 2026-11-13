import type { Fixture } from './types.js';
const items = [
  { id: 'one', label: 'One' },
  { value: 'two', label: 'Two' },
  { id: 'three', label: 'Three', disabled: true },
];
export default [
  { id: 'default', props: { items } },
  { id: 'selected-value', props: { items, value: 'two', size: 'sm' } },
  { id: 'active-id-custom', props: { items, activeId: 'three', class: 'consumer', style: 'color: red', 'data-bench': 'switcher' } },
  { id: 'fallback-ids', props: { items: [{ label: 'Plain' }, { label: 'Second', disabled: true }] } },
  { id: 'unknown-selection', props: { items, value: 'missing', size: 'lg' } },
  { id: 'empty', props: { items: [] } },
] satisfies Fixture[];
