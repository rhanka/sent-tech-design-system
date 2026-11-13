import type { Fixture } from './types.js';
export default [
  { id: 'default', props: {}, slots: { default: 'Save' } },
  { id: 'secondary-small', props: { variant: 'secondary', size: 'sm', type: 'submit' }, slots: { default: '<strong>Submit</strong>' } },
  { id: 'ghost-large', props: { variant: 'ghost', size: 'lg', class: 'consumer', style: 'color: red', 'aria-label': 'Open menu' }, slots: { default: 'Menu' } },
  { id: 'danger-disabled', props: { variant: 'danger', disabled: true, type: 'reset' }, slots: { default: 'Reset' } },
  { id: 'empty', props: { 'aria-label': 'Empty action' } },
] satisfies Fixture[];
