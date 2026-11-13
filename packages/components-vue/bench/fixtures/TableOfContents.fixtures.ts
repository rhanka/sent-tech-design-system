import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { items: [{ id: 'intro', label: 'Intro' }, { id: 'setup', label: 'Setup', level: 2 }], activeId: 'setup' } },
  { id: 'titled', props: { title: 'Contents', items: [{ id: 'a', label: 'Alpha' }, { id: 'b', label: 'Beta', level: 3 }] } },
  { id: 'hashes', props: { title: 'Sommaire', items: [{ id: '#one', label: 'One' }, { id: '#two', label: 'Two', level: 0 }], activeId: '#one' } },
  { id: 'custom-attrs', props: { title: 'Guide', items: [{ id: 'x', label: 'X' }], class: 'consumer', style: 'color: red', 'data-bench': 'tableOfContents' } },
  { id: 'empty', props: { items: [] } },
] satisfies Fixture[];
