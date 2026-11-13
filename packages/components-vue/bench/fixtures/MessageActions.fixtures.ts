import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { actions: [{ id: 'reply', label: 'Reply' }, { id: 'forward', label: 'Forward' }] } },
  { id: 'icon-only', props: { actions: [{ id: 'pin', icon: 'Pin' }, { id: 'archive', icon: 'Archive' }], visibility: 'always' } },
  { id: 'danger-disabled', props: { actions: [{ id: 'delete', label: 'Delete', variant: 'danger', disabled: true }] } },
  { id: 'label-and-icon', props: { actions: [{ id: 'edit', label: 'Edit', icon: 'Pen' }, { label: 'No id' }], class: 'consumer', style: 'color: red', 'data-bench': 'actions' } },
  { id: 'empty', props: { actions: [] } },
] satisfies Fixture[];
