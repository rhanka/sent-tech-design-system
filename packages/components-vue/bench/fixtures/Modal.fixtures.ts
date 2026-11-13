import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { open: true, title: 'Delete item' }, slots: { default: 'This action cannot be undone.' } },
  { id: 'description', props: { open: true, title: 'Settings', description: 'Changes apply immediately.' }, slots: { default: '<p>Details</p>' } },
  { id: 'footer-actions', props: { open: true, title: 'Confirm' }, slots: { default: 'Are you sure?', footer: '<button>Cancel</button><button>OK</button>' } },
  { id: 'closed', props: { open: false, title: 'Hidden' }, slots: { default: 'Not rendered' } },
  { id: 'custom-close', props: { open: true, title: 'Localized', closeLabel: 'Fermer', class: 'consumer', style: 'color: red', 'data-bench': 'modal' }, slots: { default: 'Body' } },
] satisfies Fixture[];
