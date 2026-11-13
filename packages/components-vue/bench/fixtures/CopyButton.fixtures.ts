import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { text: 'bonjour' } },
  { id: 'small-value', props: { value: '42', size: 'sm' } },
  { id: 'english-labels', props: { text: 'hello', locale: 'en-US', label: 'Copy ID', copiedLabel: 'Copied ID', size: 'lg' } },
  { id: 'custom-class', props: { text: 'x', class: 'consumer', style: 'color: red', 'data-bench': 'copy' } },
  { id: 'no-text', props: { value: 'standalone' } },
  { id: 'empty', props: {} },
] satisfies Fixture[];
