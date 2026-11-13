import type { Fixture } from './types.js';
export default [
  { id: 'default', props: {} },
  { id: 'lines-width', props: { lines: 3, width: '200px' } },
  { id: 'heading', props: { heading: true, lines: 2 } },
  { id: 'paragraph', props: { paragraph: true, lines: 2 } },
  { id: 'locale-en', props: { locale: 'en-US', loadingLabel: 'Loading' } },
  { id: 'custom', props: { lines: 2, class: 'consumer', style: 'color: red', 'data-bench': 'skeleton' } },
] satisfies Fixture[];
