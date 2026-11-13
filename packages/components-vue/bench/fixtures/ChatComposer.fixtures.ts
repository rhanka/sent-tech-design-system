import type { Fixture } from './types.js';
export default [
  { id: 'default', props: {} },
  { id: 'with-value', props: { value: 'Hello there' } },
  { id: 'custom', props: { value: 'Draft', placeholder: 'Write…', submitLabel: 'Post', class: 'consumer', style: 'color: red', 'data-bench': 'composer' } },
  { id: 'with-slot', props: { value: 'Hi', submitLabel: 'Send' }, slots: { default: '<button type="button">Attach</button><button type="button">Emoji</button>' } },
  { id: 'whitespace', props: { value: '   ' } },
] satisfies Fixture[];
