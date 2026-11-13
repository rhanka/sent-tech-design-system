import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { title: 'Item' } },
  { id: 'full', props: { title: 'Item', caption: 'Caption', value: 'a', count: 0, depth: 2, status: 'error', selected: true, divider: true, swatch: { color: 'red', shape: 'circle' } } },
  { id: 'tone', props: { title: 'Item', swatch: { tone: 'success' }, href: '/item', count: 5, depth: 99, class: 'consumer', 'data-bench': 'nav' } },
  { id: 'slots', props: { title: 'Item', count: 4, swatch: { color: 'red' } }, slots: { leading: '<b>Lead</b>', trailing: '<em>Tail</em>' } },
  { id: 'disabled', props: { title: 'Disabled', disabled: true, depth: -1 } },
] satisfies Fixture[];
