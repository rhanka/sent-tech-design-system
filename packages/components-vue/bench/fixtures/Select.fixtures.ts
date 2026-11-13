import type { Fixture } from './types.js';
const options = [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta', disabled: true }, { value: 'c', label: 'Gamma' }];
export default [
  { id: 'default', props: { options } },
  { id: 'label-help-selected', props: { label: 'Letter', helperText: 'Choose one', options, modelValue: 'c', name: 'letter' } },
  { id: 'error-small', props: { label: 'Letter', errorText: 'Required', helperText: 'Hidden', invalid: true, size: 'sm', options } },
  { id: 'disabled-large', props: { label: 'Disabled', disabled: true, size: 'lg', options, modelValue: 'a' } },
  { id: 'default-slot-overrides-options', props: { label: 'Grouped', options, modelValue: 'x', class: 'consumer', style: 'color: red', 'aria-label': 'Custom letters' }, slots: { default: '<optgroup label="Group"><option value="x">Extra</option><option value="y" disabled>Unavailable</option></optgroup>' } },
  { id: 'empty-invalid', props: { invalid: true, options: [] } },
] satisfies Fixture[];
