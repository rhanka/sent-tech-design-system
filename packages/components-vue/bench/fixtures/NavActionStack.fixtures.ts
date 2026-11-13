import { h } from 'vue';
import type { Fixture } from './types.js';
const OldIcon = () => h('i', { 'aria-hidden': 'true' }, 'Icon');
export default [
  { id: 'default', props: { actions: [{ label: 'Save', kind: 'primary' }, { label: 'Cancel', kind: 'ghost' }] } },
  { id: 'links', props: { actions: [{ label: 'Link', href: '/a' }, { label: 'Disabled', href: '/b', disabled: true }], orientation: 'horizontal' } },
  { id: 'danger', props: { dangerZone: { label: 'Delete' }, class: 'consumer', 'data-bench': 'actions' } },
  { id: 'danger-link', props: { dangerZone: { label: 'Delete', href: '/delete' }, dangerLabel: 'Danger' } },
  { id: 'rich-icons', props: { actions: [{ label: 'Save' }], dangerZone: { label: 'Delete' } }, legacyProps: { actions: [{ label: 'Save', icon: OldIcon }], dangerZone: { label: 'Delete', icon: OldIcon } }, slots: { 'action-icon': '<i aria-hidden="true">Icon</i>', 'danger-icon': '<i aria-hidden="true">Icon</i>' } },
] satisfies Fixture[];
