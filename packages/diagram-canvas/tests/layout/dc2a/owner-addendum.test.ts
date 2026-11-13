import { readFileSync, writeFileSync } from 'node:fs';
import { describe,expect,it } from 'vitest';
import { layoutScene,resolveScene,resolveScenePresentation } from '../../../src/presentation/diagramSceneModel.js';
import { channelGap,channelMetrics } from '../../../src/layout/channels.js';
import { measureBundleLabel } from '../../../src/layout/bundleLabel.js';
import { hCondInput } from './h-cond.js';
import { ownerInput,ownerFixture,ownerFixtureNames } from './owner-fixtures.js';
import { renderCardSvg } from '../../../src/presentation/renderCardSvg.js';
import { renderZoneSvg } from '../../../src/presentation/renderZoneSvg.js';
import { defaultCardMeasure,sceneCardMeasure,projectCardProps,projectZoneProps } from '../../../src/presentation/diagramCardModel.js';
import { getDiagramGlyph } from '../../../src/presentation/registry.js';
const median=(xs:number[])=>{xs.sort((a,b)=>a-b);return xs.length%2?xs[(xs.length-1)/2]!:(xs[xs.length/2-1]!+xs[xs.length/2]!)/2;};
describe('Owner addendum A1–A13',()=>{
 for(const name of ['architecture','ontology'] as const)for(const folded of [false,true])it(`should size every ${name}/${folded} channel from routed traffic (A1)`,()=>{
  const input=hCondInput(name,folded),result=layoutScene(input);if(result.status!=='laid-out')throw new Error(JSON.stringify(result));
  expect(result.channels?.length).toBeGreaterThan(0);
  const scene=resolveScene(result,input);
  const hits=(a:{x:number;y:number;width:number;height:number},b:{x:number;y:number;width:number;height:number})=>a.x<b.x+b.width&&b.x<a.x+a.width&&a.y<b.y+b.height&&b.y<a.y+a.height;
  for(const c of result.channels!){
    const routed=scene.edges.filter(edge=>edge.points.slice(1).some((end,index)=>{const start=edge.points[index]!;return c.strips.some(strip=>hits(strip,{x:Math.min(start.x,end.x),y:Math.min(start.y,end.y),width:Math.abs(start.x-end.x),height:Math.abs(start.y-end.y)}));}));
    const n=routed.reduce((sum,edge)=>sum+(result.edgeBundles?.[edge.occurrence]?.members.length??1),0);
    const labelled=scene.labels.some(label=>c.strips.some(strip=>hits(strip,label.box)));
    const horizontal=c.axis==='horizontal';const min=horizontal?96:72,base=horizontal?64:8,pitch=horizontal?14:7;
    const expected=n===0?min:Math.min(240,Math.max(min,base+n*pitch+(labelled?30:0)));
    expect(c.n).toBe(n);expect(c.labelled).toBe(labelled);expect(c.gap,c.id).toBeCloseTo(expected,0);
  }
 });
 for(const name of ownerFixtureNames())it(`should retain all ${name} cards, icons and complete text (A2/A5/A11)`,()=>{
  const input=ownerInput(name),result=layoutScene(input);
  const scene=resolveScene(result,input),fixture=ownerFixture(name);
  for(const channel of result.channels??[])expect(channel.gap, name+' '+channel.id).toBeCloseTo(channel.expected,0);
  let refused=0;
  for(const node of scene.nodes){
   const source=fixture.cards.find(c=>'entity:'+c.id===node.entity)!;
   const project=node.kind==='zone'?projectZoneProps(node.presentation,{entityId:node.entity,collapsed:node.collapsed,width:node.rect.width,height:node.rect.height,resolveGlyph:getDiagramGlyph}):projectCardProps(node.presentation,{entityId:node.entity,resolveGlyph:getDiagramGlyph});
   if(project.kind==='label')continue;
   const rendered=project.kind==='zone'?renderZoneSvg({...project.props,autoSize:true}):renderCardSvg({...project.props,autoSize:true,height:node.rect.height},sceneCardMeasure(defaultCardMeasure));
   if(rendered.kind==='refused'){refused++;continue;}
   expect(rendered.svg).toContain('data-diagram-icon=');
   const card='collapsed' in rendered.layout?rendered.layout.card:rendered.layout;
   const header='header' in rendered.layout?rendered.layout.header:undefined;
   const lines=card!==undefined?[...card.kicker,...card.title,...card.body,...card.footerLines]:header===undefined?[]:[...header.kicker,...header.title,...header.subtitle,...header.footer];
   const text=lines.map(l=>l.text).join('').replace(/\s+/g,'');
   for(const part of [source.kicker,source.title,node.kind==='zone'?source.purpose:source.purpose,node.kind==='zone'?undefined:source.detail,source.footer].filter(Boolean))expect(text).toContain(part!.replace(/\s+/g,''));
  }
  expect(refused).toBe(0);
  expect({nodes:scene.nodes.map(node=>[node.occurrence,node.rect]),labels:scene.labels.map(label=>[label.occurrence,label.lines,label.box])}).toMatchSnapshot();
 });
 for(const name of ['vue-globale','memory'])it(`should keep ${name} arrangement at 390 and1440 (A6/A13)`,()=>{
  const input=ownerInput(name,true);
  const wide=layoutScene({...input,targetWidth:1440}),narrow=layoutScene({...input,targetWidth:390});
  if(wide.status!=='laid-out'||narrow.status!=='laid-out')throw new Error('fixture refused');
  const a=resolveScene(wide,input),b=resolveScene(narrow,input);
  expect(a.nodes).toEqual(b.nodes);expect(a.orientations).toEqual(b.orientations);
  if(a.nodes.length>2)expect(new Set(a.nodes.map(n=>n.rect.x)).size).toBeGreaterThan(1);
 });
 it('should preserve explicit→binding→role order and diagnose unresolved icons (A2)',()=>{
  const input=ownerInput('vue-globale');const [id,entry]=Object.entries(input.presentation.entities)[0]!;
  const presentation={...input.presentation,entities:{[id]:{...entry,icon:'not-a-glyph'}}};
  const result=layoutScene({...input,presentation});if(result.status!=='laid-out')throw new Error('refused');
  expect(result.warnings.some(w=>w.code==='card-icon-missing')).toBe(true);
  expect(resolveScenePresentation(input.document,presentation).presentation.entities[id]!.icon).toBe('unknown');
 });
 it('should measure a header and one distinct group per bundled relation (A12)',()=>{
  const input=hCondInput('architecture',true);const relations=['reads · graph.json','a long relation '.repeat(10),'writes · records'];
  const chip=measureBundleLabel(relations,input.measureLines);
  expect(chip.groups).toHaveLength(3);expect(chip.header).toBe('3 liaisons');
  expect(chip.layout.height).toBe(chip.groups.at(-1)!.top+chip.groups.at(-1)!.height);
  expect(chip).toEqual(measureBundleLabel(relations,input.measureLines));
 });
 it('should pin measured spacing provenance without conflating incompatible A9 targets',()=>{
  const requireStats:unknown[]=[];
  for(const input of [hCondInput('architecture',false),ownerInput('vue-globale',false)]){
   const result=layoutScene(input);if(result.status!=='laid-out')throw new Error('refused');
   requireStats.push({name:input.document.documentId,channels:result.channels,medians:['horizontal','vertical'].map(axis=>[axis,median(result.channels!.filter(c=>c.axis===axis).map(c=>c.gap))])});
  }
  const pin=JSON.parse(readFileSync(new URL('./owner-spacing.json',import.meta.url),'utf8'));
  for(const record of requireStats as {name:string;medians:[string,number][]}[])for(const [axis,value] of record.medians){
    expect(value).toBe(pin.expected[record.name][axis]);
    expect(Math.abs(value-pin.ratioTarget[axis])/pin.ratioTarget[axis]).toBeLessThanOrEqual(.15);
    // Pin BOTH measurements; 2×24=48 and 160/ratio have disjoint ±15% bands.
    expect(24*2*1.15).toBeLessThan(pin.ratioTarget[axis]*.85);
  }
 });
});

it('should comb three parallel routes at the channel pitch and centre them (A1)',()=>{
 const seed=ownerInput('vue-globale');const ids=Object.entries(seed.document.entities).filter(([,entity])=>entity.type==='node').slice(0,2).map(([id])=>id);
 const occurrence=(id:string)=>'occurrence:e.'+id.slice('entity:'.length);
 const document={...seed.document,entities:Object.fromEntries(ids.map(id=>[id,seed.document.entities[id]])),relations:Object.fromEntries([0,1,2].map(i=>['relation:parallel'+i,{id:'relation:parallel'+i,profile:'generic@2',type:'link',endpoints:[{role:'source',target:ids[0]},{role:'target',target:ids[1]}],attributes:{}}]))};
 const input={...seed,document:document as typeof seed.document,presentation:{...seed.presentation,entities:Object.fromEntries(ids.map(id=>[occurrence(id),seed.presentation.entities[occurrence(id)]!]))},collapsed:[],hints:{rootOrder:ids} as never};
 const result=layoutScene(input);if(result.status!=='laid-out')throw new Error('fixture refused');const scene=resolveScene(result,input);
 expect(scene.edges).toHaveLength(3);const lanes=scene.edges.map(edge=>edge.points[1]!.x).sort((a,b)=>a-b);
 expect(lanes[1]!-lanes[0]!).toBe(14);expect(lanes[2]!-lanes[1]!).toBe(14);
 const cards=scene.nodes.map(node=>node.rect).sort((a,b)=>a.x-b.x);expect((lanes[0]!+lanes[2]!)/2).toBe((cards[0]!.x+cards[0]!.width+cards[1]!.x)/2);
});

it('should preserve identifier punctuation when it fits on a line (A5/A11)',()=>{
 const measure=sceneCardMeasure(defaultCardMeasure);
 for(const text of ['@sentropic/cluster-mesh','Notion·Slack·OpenERP·WaveApps·Stripe','app_context.relations','repo: sentropic · @sentropic/cluster-mesh'])expect(measure(text,'body',10000,1).lines).toEqual([text]);
});
