import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { totalPages: 5, page: 3 } },
  { id: 'large-total', props: { totalPages: 20, page: 10, siblings: 1 } },
  { id: 'pagecount-alias-first', props: { pageCount: 3, page: 1 } },
  { id: 'hrefs-custom-labels', props: { totalPages: 2, page: 2, previousHref: '/p1', nextHref: '/p3', previousLabel: 'Précédent', nextLabel: 'Suivant', label: 'Pages', class: 'consumer', style: 'color: red', 'data-bench': 'pager' } },
  { id: 'single', props: { totalPages: 1, page: 1 } },
] satisfies Fixture[];
