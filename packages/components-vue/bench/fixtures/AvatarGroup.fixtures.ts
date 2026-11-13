import type { Fixture } from './types.js';
const avatars = '<span class="st-avatar">AB</span><span class="st-avatar">CD</span><span class="st-avatar">EF</span>';
export default [
  { id: 'default', props: { max: 2, total: 3 }, slots: { default: avatars } },
  { id: 'no-overflow', props: { max: 5, total: 3 }, slots: { default: avatars } },
  { id: 'no-max', props: { total: 9 }, slots: { default: avatars } },
  { id: 'sized', props: { size: 'lg', max: 1, total: 4 }, slots: { default: avatars } },
  { id: 'custom', props: { max: 3, total: 10, class: 'consumer', style: 'color: red', 'data-bench': 'group' }, slots: { default: avatars } },
] satisfies Fixture[];
