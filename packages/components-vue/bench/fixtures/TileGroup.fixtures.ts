import { h } from 'vue';
import type { Fixture } from './types.js';
const items = [{ value: 'a', label: 'Alpha', description: 'First' }, { value: 'b', title: 'Beta', disabled: true }];
export default [
  { id: 'default', props: { items } },
  { id: 'checked', props: { items, value: 'b', name: 'choice', legend: 'Choices' } },
  { id: 'disabled-hidden', props: { items, disabled: true, legendHidden: true, legend: 'Hidden', class: 'consumer', 'data-bench': 'tile' } },
  { id: 'empty', props: { items: [] } },
  { id: 'rich', props: { items: [{ value: 'a', label: 'Alpha', description: 'First' }], legend: 'Choices', name: 'rich' }, legacyProps: { legend: h('b', 'Choices'), items: [{ value: 'a', label: h('strong', 'Alpha'), description: h('em', 'First') }] }, slots: { legend: '<b>Choices</b>', 'item-label': { scope: '{ item }', html: '<strong>{{ item.label }}</strong>' }, 'item-description': { scope: '{ item }', html: '<em>{{ item.description }}</em>' } } },
] satisfies Fixture[];
