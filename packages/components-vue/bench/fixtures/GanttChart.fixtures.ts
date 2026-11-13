import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { data: [{ task: 'Design', start: 0, end: 10 }, { task: 'Implement', start: 8, end: 22 }, { task: 'Release', start: 20, end: 30 }], label: 'Schedule' } },
  { id: 'categories-marker', props: { data: [{ task: 'A', start: 1, end: 5, category: 'Fast' }, { task: 'B', start: 4, end: 9, category: 'Slow' }, { task: 'C', start: 2, end: 3 }], label: 'Phases', marker: 6 } },
  { id: 'empty', props: { data: [], label: 'Empty schedule' } },
  { id: 'reversed-invalid', props: { data: [{ task: 'Reversed', start: 10, end: 2 }, { task: 'Bad', start: 0, end: 5 }, { task: '', start: 0, end: 1 }], label: 'Clean' } },
  { id: 'custom-attrs', props: { data: [{ task: 'Task', start: 0, end: 100 }], label: 'Sized', width: 800, height: 200, class: 'consumer', style: 'color: red', 'data-bench': 'gantt' } },
  { id: 'long-labels', props: { data: [{ task: 'A very long task name overflow', start: 0, end: 40 }], label: 'Long' } },
] satisfies Fixture[];
