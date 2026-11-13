import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { page: 1, totalItems: 30 } },
  { id: 'middle-page-count', props: { page: 2, pageCount: 4, totalPages: 9 } },
  { id: 'last-total-pages', props: { page: 3, totalPages: 3 } },
  { id: 'custom-labels-size', props: { page: 2, totalItems: 12, pageSize: 5, previousLabel: 'Back', nextLabel: 'Forward', class: 'consumer', style: 'color: red', 'data-bench': 'pages' } },
  { id: 'no-total', props: { page: 1 } },
  { id: 'zero-pages', props: { page: 1, pageCount: 0 } },
] satisfies Fixture[];
