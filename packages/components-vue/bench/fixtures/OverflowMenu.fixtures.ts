import type {Fixture} from './types.js';
export default [
{id:'default',props:{items:[{id:'a',label:'Alpha'}]}},
{id:'open',props:{items:[{id:'a',label:'Alpha'}],open:true}},
{id:'cascade',props:{items:[{id:'a',label:'Parent',children:[{id:'b',label:'Child'}]}],open:true}},
{id:'rich-label',props:{items:[{id:'a',label:'Alpha'}],open:true},slots:{'item-label':{scope:'{item}',html:'<strong>{{item.label}}</strong>'}}}
] satisfies Fixture[];
