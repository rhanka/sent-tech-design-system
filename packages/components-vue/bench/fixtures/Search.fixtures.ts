import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { label: 'Search', modelValue: 'hello' } },
  { id: 'empty-small', props: { size: 'sm', placeholder: 'Find', value: '' } },
  { id: 'fluid-large', props: { label: 'Query', size: 'lg', modelValue: 'Ada', fluid: true, clearLabel: 'Clear' } },
  { id: 'disabled-custom', props: { disabled: true, id: 'consumer-search', placeholder: 'x', class: 'consumer', style: 'color: red', 'data-bench': 'search' } },
  { id: 'no-label', props: { modelValue: 'test', 'aria-label': 'Search input' } },
] satisfies Fixture[];
