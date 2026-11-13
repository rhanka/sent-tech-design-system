import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { label: 'Filtres actifs' }, slots: { default: 'Pill A' } },
  { id: 'with-clear', props: { label: 'Filters', onClearAll: () => {} }, slots: { default: 'Pill A, Pill B' } },
  { id: 'custom-clear-label', props: { label: 'Filters', onClearAll: () => {}, clearAllLabel: 'Clear all' }, slots: { default: 'Pill' } },
  { id: 'custom-class', props: { label: 'Styled', onClearAll: () => {}, class: 'consumer', style: 'color: red', 'data-bench': 'filter' }, slots: { default: 'Pill' } },
  { id: 'no-slots', props: { label: 'Empty bar' } },
  { id: 'no-slots-clear', props: { label: 'Empty bar', onClearAll: () => {} } },
] satisfies Fixture[];
