import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { field: 'Country', value: 'France' } },
  { id: 'with-operator', props: { field: 'Age', value: '30', operator: '>', tone: 'info' } },
  { id: 'inactive', props: { field: 'Status', value: 'Open', active: false, tone: 'warning', class: 'consumer', style: 'color: red', 'data-bench': 'pill' } },
  { id: 'static-body', props: { field: 'Owner', value: 'Me', removable: false } },
  { id: 'clickable', props: { field: 'Tag', value: 'urgent', onClick: () => {}, onRemove: () => {}, tone: 'success' } },
  { id: 'disabled', props: { field: 'Lock', value: 'val', disabled: true, onClick: () => {}, onRemove: () => {} } },
] satisfies Fixture[];
