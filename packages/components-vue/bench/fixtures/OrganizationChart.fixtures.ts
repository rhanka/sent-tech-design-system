import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { data: [{ id: 'root', label: 'CEO' }, { id: 'a', parentId: 'root', label: 'Sales' }], label: 'HT' } },
  { id: 'tree', props: { data: [
    { id: 'root', label: 'CEO' },
    { id: 'sales', parentId: 'root', label: 'Sales' },
    { id: 'eng', parentId: 'root', label: 'Eng', tone: 'category3' },
    { id: 'a1', parentId: 'sales', label: 'EU' },
    { id: 'a2', parentId: 'sales', label: 'US' },
  ], label: 'HT', width: 640, height: 320, class: 'consumer', style: 'color: red', 'data-bench': 'org' } },
  { id: 'cycle-guard', props: { data: [{ id: 'x', parentId: 'y', label: 'X' }, { id: 'y', parentId: 'x', label: 'Y' }, { id: 'solo', label: 'Solo' }], label: 'Cycle' } },
  { id: 'empty', props: { data: [], label: 'No data' } },
] satisfies Fixture[];
