import type { Fixture } from './types.js';
const data = {
  name: 'all',
  value: 100,
  children: [
    { name: 'main', value: 60, children: [{ name: 'render', value: 40 }, { name: 'parse', value: 20 }] },
    { name: 'idle', value: 40 },
  ],
};
export default [
  { id: 'default', props: { data, label: 'Profile' } },
  { id: 'custom-size', props: { data, label: 'Profile', width: 900, height: 200, class: 'consumer', style: 'color: red', 'data-bench': 'chart' } },
  { id: 'size-prop', props: { data, label: 'Profile', size: 480 } },
  { id: 'deep', props: { data: { name: 'root', value: 10, children: [{ name: 'a', value: 10, children: [{ name: 'b', value: 10, children: [{ name: 'c', value: 10 }] }] }] }, label: 'Deep' } },
  { id: 'no-label', props: { data } },
  { id: 'flat', props: { data: { name: 'solo', value: 5 }, label: 'Flat' } },
] satisfies Fixture[];
