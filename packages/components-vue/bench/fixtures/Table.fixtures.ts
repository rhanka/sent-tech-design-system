import { h } from 'vue';
import type { Fixture } from './types.js';
const columns = [{ key: 'name', label: 'Name' }, { key: 'score', label: 'Score', align: 'right' }];
const rows = [{ id: 'a', name: 'Ann', score: 3 }, { name: 'Bob', score: 5 }];
export default [
  { id: 'default', props: { columns, rows } },
  { id: 'aligned-caption', props: { columns: [{ key: 'city', label: 'City', align: 'center' }, { key: 'pop', label: 'Pop', align: 'end' }], rows: [{ city: 'Lyon', pop: 500 }], caption: 'Cities' } },
  { id: 'rich-caption', props: { columns, rows, caption: 'Plain' },
    legacyProps: { caption: h('strong', 'Rich caption') },
    slots: { caption: '<strong>Rich caption</strong>' } },
  { id: 'rich-label', props: { columns: [{ key: 'name', label: 'Name' }, { key: 'score', label: 'Score' }], rows },
    legacyProps: { columns: [{ key: 'name', label: h('strong', 'Name') }, { key: 'score', label: h('em', 'Score') }] },
    slots: { label: { scope: '{ column }', html: '<strong v-if="column.key === \'name\'">{{ column.label }}</strong><em v-else>{{ column.label }}</em>' } } },
  { id: 'custom-attrs', props: { columns, rows, caption: 'Data', class: 'consumer', style: 'color: red', 'data-bench': 'table', 'aria-label': 'People' } },
  { id: 'empty-rows', props: { columns, rows: [] } },
] satisfies Fixture[];
