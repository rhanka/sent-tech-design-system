import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { name: 'Ada Lovelace' } },
  { id: 'with-src', props: { name: 'Ada Lovelace', src: '/ada.png' } },
  { id: 'sizes', props: { name: 'Bob', size: 'lg', shape: 'square', tone: 'category3' } },
  { id: 'alt-override', props: { name: 'Cy', alt: 'Photo of Cy', size: 'sm' } },
  { id: 'custom', props: { name: 'Di', class: 'consumer', style: 'color: red', 'data-bench': 'avatar' } },
] satisfies Fixture[];
