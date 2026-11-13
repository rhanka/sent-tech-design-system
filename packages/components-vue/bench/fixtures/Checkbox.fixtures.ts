import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { label: 'Accept terms' } },
  { id: 'model-checked', props: { label: 'Selected', modelValue: true, name: 'choice', value: 'yes' } },
  { id: 'checked-disabled', props: { label: 'Legacy checked', checked: true, disabled: true } },
  { id: 'model-overrides-checked', props: { label: 'Not selected', modelValue: false, checked: true, invalid: true } },
  { id: 'described-trailing', props: { label: 'Subscribe', description: 'Monthly news', helperText: 'Optional', 'aria-describedby': 'external-help' }, slots: { trailing: '<strong>New</strong>' } },
  { id: 'custom-help', props: { label: 'Custom', helperText: 'More details', class: 'consumer', style: 'color: red', 'data-bench': 'checkbox' } },
] satisfies Fixture[];
