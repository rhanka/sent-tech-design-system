import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { columns: [{ label: 'To do', cards: [{ id: 'c1', title: 'First' }] }] } },
  { id: 'badges-rich', props: { columns: [{ label: 'Doing', cards: [{ id: 'a', title: 'Task A', subtitle: 'Sub', owner: 'Jean', badgeLabel: 'P1', badgeTone: 'error' }, { id: 'b', title: 'Task B', badgeLabel: 'P2' }] }, { label: 'Done', cards: [] }] } },
  { id: 'empty-board', props: { columns: [] } },
  { id: 'custom-attrs', props: { columns: [{ label: 'Col', cards: [{ id: 'x', title: 'T' }] }], class: 'consumer', style: 'color: red', 'data-bench': 'kanban' } },
] satisfies Fixture[];
