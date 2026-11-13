import type { Fixture } from './types.js';
const options = [{ label: 'Alpha', value: 'a' }, { label: 'Beta', value: 'b', helperText: 'Second choice' }, { label: 'Gamma', value: 'c', disabled: true }];
export default [
  { id: 'default', props: { legend: 'Choose one', name: 'group', options } },
  { id: 'selected-horizontal', props: { legend: 'Pick a letter', name: 'group', options, value: 'b', orientation: 'horizontal', helperText: 'Only one' } },
  { id: 'disabled-group', props: { legend: 'Disabled group', name: 'group', options, disabled: true, class: 'consumer', style: 'color: red', 'data-bench': 'radiogroup' } },
  { id: 'empty-options', props: { legend: 'No options', name: 'group', options: [] } },
  { id: 'default-slot', props: { legend: 'Extra slot', name: 'group', options: [{ label: 'One', value: '1' }] }, slots: { default: '<span>Custom extra</span>' } },
  { id: 'missing-value', props: { legend: 'Missing', name: 'group', options, value: 'missing' } },
] satisfies Fixture[];
