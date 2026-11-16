import type { Fixture } from './types.js';
const base = () => ({ controls: [{ kind: 'query-search' as const, label: 'Search', fields: ['region'] }] });
export default [
  { id: 'default', props: base() },
  { id: 'date-range', props: { controls: [{ kind: 'date-range' as const, label: 'Period' }] } },
  { id: 'relative', props: { controls: [{ kind: 'relative-date' as const, label: 'Range', presets: [{ label: '7 days', from: '-7d', to: 'now' }] }] } },
  { id: 'variable', props: { controls: [{ kind: 'variable' as const, label: 'Region', dimension: 'region', multiSelect: true }] } },
  { id: 'export-chips', props: { ...base(), export: { label: 'Export', fields: ['region'], filenameTemplate: 'export' }, chips: true, activeFilters: [{ field: 'region', operator: 'eq' as const, value: 'North' }] } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'filterbar' } },
] satisfies Fixture[];
