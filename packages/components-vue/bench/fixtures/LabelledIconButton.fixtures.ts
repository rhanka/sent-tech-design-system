import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { label: 'SENTINEL-LABEL', icon: 'comment' } },
  { id: 'danger-small-disabled', props: { label: 'Delete', icon: 'close', disabled: true, variant: 'danger', size: 'sm' } },
  { id: 'pressed-shortcut', props: { label: 'Show', icon: 'eye', pressed: true, ariaKeyshortcuts: 'Alt+Shift+Z', tooltipContent: 'Show details (Alt+Shift+Z)' } },
  { id: 'bottom-custom-unpressed', props: { label: '<b>Settings</b>', icon: 'settings', size: 'lg', variant: 'secondary', tooltipPlacement: 'bottom', class: 'consumer', pressed: false } },
] satisfies Fixture[];
