import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { selectId: 'lang-select' } },
  { id: 'english', props: { locale: 'en', selectId: 'lang-select' } },
  { id: 'accordion', props: { variant: 'accordion', locale: 'en', accordionLabel: 'Language' } },
  { id: 'custom-labels', props: { frLabel: 'Français', enLabel: 'English', label: 'Choose', selectId: 'lang-select' } },
  { id: 'custom-attrs', props: { variant: 'accordion', class: 'consumer', style: 'color: red', 'data-bench': 'lang-toggle' } },
] satisfies Fixture[];
