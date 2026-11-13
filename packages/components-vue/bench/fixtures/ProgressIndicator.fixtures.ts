import { h } from 'vue';
import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { items: [{ label: 'One', status: 'complete' }, { label: 'Two', status: 'current' }, { label: 'Three', status: 'upcoming' }] } },
  { id: 'vertical-alias', props: { vertical: true, items: [{ label: 'A', status: 'invalid', description: 'Broken' }, { label: 'B', status: 'disabled' }] } },
  { id: 'incomplete', props: { orientation: 'vertical', items: [{ label: 'A', status: 'incomplete' }, { label: 'B' }], class: 'consumer', style: 'color: red', 'data-bench': 'indicator' } },
  { id: 'empty', props: { items: [] } },
{ id:'rich-items',props:{items:[{label:'One',description:'Details'}]},legacyProps:{items:[{label:h('strong','One'),description:h('em','Details')}]},slots:{'item-label':{scope:'{ item }',html:'<strong>{{item.label}}</strong>'},'item-description':{scope:'{ item }',html:'<em>{{item.description}}</em>'}} },
] satisfies Fixture[];
