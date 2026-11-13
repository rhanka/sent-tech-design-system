import type {Fixture} from './types.js';
export default [
{id:'default',props:{items:[{id:'a',label:'Alpha'}]}},
{id:'groups',props:{items:[{type:'group',label:'Group',items:[{id:'a',label:'Alpha'}]}]}},
{id:'cascade',props:{items:[{id:'a',label:'Parent',children:[{id:'b',label:'Child'}]}]}},
{id:'rich-label',props:{items:[{id:'a',label:'Alpha'}]},slots:{'item-label':{scope:'{item}',html:'<strong>{{item.label}}</strong>'}}},
{id:'attrs',props:{items:[],id:'caller-menu',class:'consumer','aria-label':'Actions'}}
] satisfies Fixture[];
