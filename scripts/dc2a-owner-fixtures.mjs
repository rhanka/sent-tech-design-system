/** Read-only extraction of cleared diagram data; never imports a renderer or opens a browser. */
import fs from 'node:fs';
const root = new URL('../packages/diagram-canvas/tests/layout/dc2a/fixtures/owner/', import.meta.url);
fs.mkdirSync(root, {recursive:true});
const kit = '/home/antoinefa/src/sentropic/tmp/worktrees/ecosystem-ds/docs/governance/kit/src/presentation-scenes.json';
const original = JSON.parse(fs.readFileSync(kit,'utf8')).en.architectureScenes.central;
const group = g => ({id:g.id,parentId:g.parentId ?? null,container:true,folded:g.collapsed ?? false,
 kicker:g.kicker??null,title:g.title??null,purpose:g.subtitle??null,detail:null,footer:g.cardFooter??null,icon:g.cardIcon??'cluster',
 old:{...g.position,width:g.width,height:g.height}});
const node = n => ({id:n.id,parentId:n.parentId??null,container:false,folded:false,kicker:n.data.kicker??null,
 title:n.data.title??null,purpose:n.data.function??null,detail:n.data.detail??null,footer:n.data.cardFooter??null,icon:n.data.cardIcon??'base',
 old:{...n.position,width:n.width,height:n.height}});
function write(id,cards,edges,source){fs.writeFileSync(new URL(id+'.json',root),JSON.stringify({id,source,cards,edges:edges.map(e=>({id:e.id,source:e.source,target:e.target,label:e.label??null}))},null,2)+'\n');}
const all=[...original.groups.map(group),...original.nodes.map(node)];
for(const frame of ['h2a','surfaces','cluster-mesh','cm-catalog','cat-mcp','cm-storage','cm-security','cm-cluster','engram','design-system']){
 const ids=new Set([frame]); let changed=true;while(changed){changed=false;for(const c of all)if(c.parentId&&ids.has(c.parentId)&&!ids.has(c.id)){ids.add(c.id);changed=true;}}
 const cards=all.filter(c=>ids.has(c.id)).map(c=>({...c,parentId:ids.has(c.parentId)?c.parentId:null,folded:false}));
 write('readme-frame-'+frame,cards,original.edges.filter(e=>ids.has(e.source)&&ids.has(e.target)),{kind:'README frame',path:kit,frame});
}
write('readme-overview',all.map(c=>({...c,folded:c.container&&c.parentId===null})),original.edges,{kind:'README overview',path:kit});
write('readme-frame-central',all.map(c=>({...c,folded:false})),original.edges,{kind:'Additional full unfolded frame; ten named frames exist in the source manifest',path:kit});
const memoryPath='/home/antoinefa/src/h2a/tmp/h-cond/memory-dossier/kit/src/memory-scenes-r14.json';
const memory=JSON.parse(fs.readFileSync(memoryPath,'utf8')).roles;
write('memory', [...memory.groups.map(group),...memory.nodes.map(node)], memory.edges,{kind:'Memory R14',path:memoryPath,layout:memory.layout});
const vuePath=new URL('../packages/diagram-canvas/tests/layout/dc2a/fixtures/vue-globale/vue-globale.views.json',import.meta.url);
const vue=JSON.parse(fs.readFileSync(vuePath,'utf8')).views.after;
write('vue-globale',vue.cards.map(c=>({...c,icon:({runtime:'server',store:'db',actor:'user',api:'api'})[c.kind]??(c.container?'cluster':'base'),
 old:vue.view.entityOccurrences['occurrence:o-'+c.id]?.geometry})),vue.edges.map(edge=>{const occ=vue.view.relationOccurrences['occurrence:e-'+edge.id];return {...edge,...Object.fromEntries(['source','target'].map(role=>[role,occ?.endpoints.find(end=>end.role===role)?.occurrence.replace(/^occurrence:o-/, '')??edge[role]]))};}),{kind:'DC-2a DS fixture; R14 layout rules',path:'fixtures/vue-globale/vue-globale.views.json'});
