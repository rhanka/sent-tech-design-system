import type { Fixture } from './types.js';
export default [
  { id: 'default', props: {}, slots: { default: '<p>Card content</p>' } },
  { id: 'interactive', props: { interactive: true }, slots: { default: '<h3>Title</h3><p>Body</p>' } },
  { id: 'custom', props: { interactive: true, class: 'consumer', style: 'color: red', 'data-bench': 'card' }, slots: { default: 'Text' } },
  { id: 'empty', props: {} },
] satisfies Fixture[];
