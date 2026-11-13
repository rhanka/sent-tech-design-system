import type { Fixture } from './types.js';
const options = [{ value: 'a', label: 'Apple' }, { value: 'b', label: 'Banana' }, { value: 'c', label: 'Cherry', disabled: true }];
export default [
  { id: 'default', props: { options, label: 'Fruits', value: ['a'] } },
  { id: 'open-panel', props: { options, label: 'Fruits', open: true, value: ['a', 'b'] } },
  { id: 'disabled-invalid', props: { options, label: 'Fruits', disabled: true, errorText: 'Requis', value: [] } },
  { id: 'selected-alias-help', props: { options, selected: ['b'], helperText: 'Choisissez au moins un fruit.' } },
  { id: 'en-locale', props: { options, locale: 'en-US', open: true, placeholder: 'Pick fruits', class: 'consumer', style: 'color: red', 'data-bench': 'multi' } },
  { id: 'no-results', props: { options: [], open: true, label: 'Vide' } },
] satisfies Fixture[];
