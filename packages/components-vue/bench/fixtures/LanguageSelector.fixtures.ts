import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { options: [{ value: 'fr', label: 'Français' }, { value: 'en', label: 'English' }], value: 'fr' } },
  { id: 'open-menu', props: { options: [{ value: 'fr', label: 'Français' }, { value: 'en', label: 'English' }], value: 'en', open: true } },
  { id: 'no-value', props: { options: [{ value: 'fr', label: 'Français' }, { value: 'en', label: 'English' }] } },
  { id: 'custom-attrs', props: { options: [{ value: 'fr', label: 'FR' }], value: 'fr', class: 'consumer', style: 'color: red', 'data-bench': 'language' } },
] satisfies Fixture[];
