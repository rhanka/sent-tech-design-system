import type { Fixture } from './types.js';
const anchor = document.createElement('button');
export default [
  { id: 'default', props: { anchor, open: true, arrow: true }, slots: { default: '<button>Panel</button>' } },
  { id: 'inline', props: { anchor, open: true, portal: false, placement: 'top-end', strategy: 'fixed', trapFocus: true }, slots: { default: '<p>Inline</p>' } },
  { id: 'closed', props: { anchor, open: false } },
  { id: 'no-anchor', props: { open: true } },
  { id: 'attrs', props: { anchor, open: true, class: 'consumer' }, slots: { default: 'Text' } },
{ id:'inline-attrs',props:{anchor,open:true,portal:false,id:'inline-panel',role:'dialog','aria-label':'Inline'},slots:{default:'Panel'} },
] satisfies Fixture[];
