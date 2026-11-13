import { h } from 'vue';
import type { Fixture } from './types.js';
const items = [{ id: 'one', label: 'One', content: 'First panel' }, { value: 'two', label: 'Two', content: 'Second panel' }, { id: 'three', label: 'Three', content: 'Third panel', disabled: true }];
export default [
  { id: 'default', props: { items } },
  { id: 'active-value', props: { items, activeValue: 'two', label: 'Sections' } },
  { id: 'active-id', props: { items, activeId: 'three', class: 'consumer', style: 'color: red', 'data-bench': 'tabs' } },
  { id: 'fallback-ids-disabled-first', props: { items: [{ label: 'Disabled', disabled: true }, { label: 'Enabled', content: 'Automatic ID' }] } },
  { id: 'unknown-active', props: { items, activeValue: 'missing' } },
  { id: 'empty', props: { items: [] } },
  { id: 'rich-item-slots', props: { items: [{ id: 'rich', label: 'Rich', content: 'Panel' }] },
    legacyProps: { items: [{ id: 'rich', label: h('strong', 'Rich'), content: h('em', 'Panel') }] },
    slots: { 'tab-label': { scope: '{ item }', html: '<strong>{{ item.label }}</strong>' }, panel: { scope: '{ item }', html: '<em>{{ item.content }}</em>' } } },
] satisfies Fixture[];
