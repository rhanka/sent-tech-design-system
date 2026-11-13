import { h } from 'vue';
import type { Fixture } from './types.js';
const nodes = [{ id: 'a', label: 'Alpha', children: [{ id: 'b', label: 'Beta' }, { id: 'c', label: 'Disabled', disabled: true }] }, { id: 'd', label: 'Delta' }];
export default [
  { id: 'default', props: { nodes, onSelect: () => {} } },
  { id: 'static', props: { nodes, selected: 'd', defaultExpanded: ['a'] } },
  { id: 'controlled', props: { nodes, selectedId: 'b', expandedIds: ['a'], 'onUpdate:selectedId': () => {}, 'aria-label': 'Custom', class: 'consumer' } },
  { id: 'empty', props: { nodes: [] } },
  { id: 'rich', props: { nodes: [{ id: 'a', label: 'Alpha' }] }, legacyProps: { nodes: [{ id: 'a', label: h('strong', 'Alpha') }] }, slots: { 'node-label': { scope: '{ node }', html: '<strong>{{ node.label }}</strong>' } } },
] satisfies Fixture[];
