import type { Fixture } from './types.js';
export default [
  { id: 'default', props: {}, slots: { default: '<img src="/x.svg" alt="" />' } },
  { id: 'numeric', props: { ratio: 16 / 9 }, slots: { default: '<video autoplay muted playsinline></video>' } },
  { id: 'wide', props: { ratio: '21 / 9' }, slots: { default: '<span>Wide</span>' } },
  { id: 'custom', props: { ratio: '4 / 3', class: 'consumer', style: 'color: red', 'data-bench': 'aspect' }, slots: { default: 'Text' } },
  { id: 'empty', props: {} },
] satisfies Fixture[];
