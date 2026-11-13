import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { item: { id: 'theme', name: 'Theme', key: 'theme.mode', description: 'Color mode', sourceLevel: 'code', version: 2 }, onCopy: (_id: string) => {} } },
  { id: 'copied-custom', props: { item: { id: 'copy-1', name: 'Custom theme', key: 'theme.custom', sourceLevel: 'user', parentId: 'theme', version: 1 }, onEdit: (_id: string) => {}, onReset: (_id: string) => {}, class: 'consumer', style: 'color: red', 'data-bench': 'card' } },
  { id: 'user-created', props: { item: { id: 'mine', name: 'My item', sourceLevel: 'user' }, onEdit: (_id: string) => {}, onDelete: (_id: string) => {} } },
  { id: 'system-no-actions', props: { item: { id: 'sys', name: 'Locked', sourceLevel: 'admin', parentId: null } } },
  { id: 'disabled-custom', props: { item: { id: 'dis', name: 'Disabled', key: 'k', sourceLevel: 'user', parentId: 'p' }, onEdit: (_id: string) => {}, onReset: (_id: string) => {}, disabled: true } },
  { id: 'with-slot', props: { item: { id: 's', name: 'Styled', sourceLevel: 'user' } }, slots: { default: '<strong>Extra</strong> detail' } },
] satisfies Fixture[];
