import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { content: 'Info', label: 'Info' } },
  { id: 'open-title', props: { content: 'Details', label: 'Details', open: true, title: 'More' } },
  { id: 'placement-top', props: { content: 'Above', placement: 'top' } },
  { id: 'content-slot', props: { label: 'Slot content' }, slots: { default: 'Trigger', content: '<strong>Rich</strong> content' } },
  { id: 'custom-attrs', props: { content: 'Attrs', class: 'consumer', style: 'color: red', 'data-bench': 'popover' } },
{ id:'empty-content-precedence',props:{open:true,content:''},slots:{content:'<strong>Hidden</strong>'} },
] satisfies Fixture[];
