import { h } from 'vue';
import type { Fixture } from './types.js';
const columns = [{ key: 'name', label: 'Name', width: '10rem' }, { key: 'value', label: 'Value', align: 'end', sortable: false }];
const rows = [{ id: 'a', name: 'Alpha', value: 2 }, { id: 'b', name: 'Beta', value: 1 }, { id: 'c', name: 'Gamma', value: null }];
export default [
  { id: 'default', props: { columns, rows } },
  { id: 'multiple-page', props: { columns, rows, selectable: 'multiple', selectedIds: ['b'], pageSize: 2, sortBy: { key: 'name', direction: 'desc' }, caption: 'Data', size: 'sm' } },
  { id: 'single', props: { columns, rows, selectable: 'single', selectedIds: ['a'], sortable: false, pageSize: 1, page: 99, locale: 'en', size: 'lg' } },
  { id: 'empty', props: { columns, rows: [], selectable: 'multiple', pageSize: 2, emptyLabel: 'Empty' } },
  { id: 'decorations', props: { columns: [{ key: 'value', label: 'Value', cellDecoration: () => ({ intent: 'warning', icon: 'triangle-alert' }) }], rows, decorations: { a: { value: { intent: 'positive', icon: 'trending-up' } }, b: { value: { intent: 'negative', icon: 'unknown' } } } } },
  { id: 'attrs', props: { columns, rows, sortBy: { key: 'value', direction: 'asc' }, pageSize: 0, class: 'consumer', style: 'color: red', 'data-bench': 'table', onRowClick: () => {} } },
  { id: 'scalar-cell', props: { columns: [{ key: 'name', label: 'Name', cell: (row: Record<string, unknown>) => `Name: ${row.name}` }], rows } },
  { id: 'rich', props: { columns: [{ key: 'name', label: 'Name' }], rows: [rows[0]], caption: 'Data' }, legacyProps: { caption: h('em', 'Data'), columns: [{ key: 'name', label: h('strong', 'Name'), cell: (row: Record<string, unknown>) => h('b', String(row.name)) }] }, slots: { caption: '<em>Data</em>', 'column-label': { scope: '{ column }', html: '<strong>{{ column.label }}</strong>' }, cell: { scope: '{ value }', html: '<b>{{ value }}</b>' } } },
] satisfies Fixture[];
