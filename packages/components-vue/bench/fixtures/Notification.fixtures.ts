import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { title: 'Saved' } },
  { id: 'error-alert', props: { tone: 'error', title: 'Failed', message: 'Try again.', dismissible: true } },
  { id: 'success-dismiss-en', props: { tone: 'success', title: 'Done', message: 'All good.', dismissible: true, locale: 'en-US' } },
  { id: 'actions-slot', props: { tone: 'warning', title: 'Careful' }, slots: { default: 'Body text', actions: '<button>Retry</button>' } },
  { id: 'custom-dismiss', props: { tone: 'info', title: 'Heads up', dismissLabel: 'Fermer la notif', class: 'consumer', style: 'color: red', 'data-bench': 'notif' } },
] satisfies Fixture[];
