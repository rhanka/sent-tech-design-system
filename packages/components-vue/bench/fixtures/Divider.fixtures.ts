import type { Fixture } from './types.js';
export default [
  { id: 'default', props: {} },
  { id: 'vertical', props: { orientation: 'vertical', spacing: 4 } },
  { id: 'labeled', props: { label: 'Or', spacing: 2, variant: 'dashed', class: 'consumer', style: 'color: red', 'data-bench': 'divider' } },
  { id: 'dashed-spaced', props: { variant: 'dashed', spacing: 8 } },
  { id: 'vertical-label-ignored', props: { orientation: 'vertical', label: 'X', spacing: 0 } },
  { id: 'empty-label', props: { label: '' } },
] satisfies Fixture[];
