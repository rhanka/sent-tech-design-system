import { h } from 'vue';
import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { items: ['Alpha', 'Beta'] } },
  { id: 'recursive', props: { items: [{ content: 'Parent', children: ['Child', { content: 'Branch', children: ['Leaf'] }] }] } },
  { id: 'attrs', props: { items: [0, null, false, ''], nested: true, class: 'consumer', start: 3 } },
  { id: 'empty', props: { items: [] } },
  { id: 'rich', props: { items: [{ content: 'Parent', children: [{ content: 'Child' }] }] }, legacyProps: { items: [{ content: h('strong', 'Parent'), children: [{ content: h('strong', 'Child') }] }] }, slots: { item: { scope: '{ item }', html: '<strong>{{ item.content }}</strong>' } } },
] satisfies Fixture[];
