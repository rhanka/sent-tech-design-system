import type { Fixture } from './types.js';
export default [
  { id: 'default', props: {}, slots: { default: 'Menu' } },
  { id: 'open', props: { open: true }, slots: { default: 'Menu' } },
  { id: 'expanded-alias', props: { expanded: true }, slots: { default: 'Account' } },
  { id: 'secondary-large-disabled', props: { variant: 'secondary', size: 'lg', disabled: true, class: 'consumer', style: 'color: red', 'aria-label': 'Actions' }, slots: { default: '<strong>Actions</strong>' } },
  { id: 'fallback-icon', props: { size: 'sm', variant: 'secondary' } },
] satisfies Fixture[];
