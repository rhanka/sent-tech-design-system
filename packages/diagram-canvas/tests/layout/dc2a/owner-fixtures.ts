import { readFileSync, readdirSync } from 'node:fs';
import { CURRENT_SCHEMA_VERSION, occurrenceRef, entityRef, type EntityRef, m3ProfileRegistry, shippedExecutorBindings, DIAGRAM_PRESENTATION_CONTRACT_PIN, type SemanticDocument, type DiagramPresentation } from '@sentropic/diagram-core';
import { cardLineMeasurer, defaultCardMeasure, sceneCardMeasure } from '../../../src/presentation/diagramCardModel.js';
interface Card { id:string; parentId:string|null; container:boolean; folded:boolean; title:string; kicker?:string; purpose?:string; detail?:string; footer?:string; icon?:string }
export interface OwnerFixture { id:string; cards:Card[]; edges:{id:string;source:string;target:string;label?:string}[]; source:unknown }
const folder = new URL('./fixtures/owner/',import.meta.url);
const filePath = (url:URL) => decodeURIComponent(url.pathname).replace(/^\/@fs(?=\/)/, '');
export const ownerFixtureNames = () => readdirSync(filePath(folder)).filter(name=>name.endsWith('.json')).map(name=>name.slice(0,-5));
export function ownerFixture(name:string):OwnerFixture { return JSON.parse(readFileSync(filePath(new URL('./fixtures/owner/'+name+'.json',import.meta.url)),'utf8')); }
export function ownerInput(name:string, folded?:boolean) {
 const fixture=ownerFixture(name);
 const entities:Record<string,unknown>={},relations:Record<string,unknown>={},forms:Record<string,unknown>={};
 const ordering:Record<string,EntityRef[]>={},rootOrder:EntityRef[]=[];
 const ids=new Set(fixture.cards.map(card=>card.id));
 for(const card of fixture.cards){
  const id=entityRef(card.id);
  entities[id]={id,profile:'generic@2',type:card.container?'container':'node',attributes:{name:{kind:'text',value:card.title??card.id}}};
  const text:Record<string,string>={title:card.title??card.id};
  for(const [key,value] of Object.entries({kicker:card.kicker,[card.container?'subtitle':'body']:card.purpose,detail:card.detail,footer:card.footer})) if(value)text[key]=value;
  forms['occurrence:e.'+card.id]={form:card.container?'container':'card',text,...(card.icon?{icon:card.icon}:{})};
  if(card.parentId&&ids.has(card.parentId)){
   const parent=entityRef(card.parentId);
   (ordering[parent]??=[]).push(id);
   const relation='relation:contains.'+card.id;
   relations[relation]={id:relation,profile:'generic@2',type:'contains',endpoints:[{role:'parent',target:parent},{role:'child',target:id}],attributes:{}};
  } else rootOrder.push(id);
 }
 const approved=(fixture.source as {layout?:{top:string[];children:Record<string,string[]>}}).layout;
 if(approved){
  rootOrder.splice(0,rootOrder.length,...approved.top.map(entityRef));
  for(const [parent,children] of Object.entries(approved.children))ordering[entityRef(parent)]=children.map(entityRef);
 }
 for(const edge of fixture.edges){
  if(!ids.has(edge.source)||!ids.has(edge.target))continue;
  const id='relation:link.'+edge.id;
  relations[id]={id,profile:'generic@2',type:'link',endpoints:[{role:'source',target:'entity:'+edge.source},{role:'target',target:'entity:'+edge.target}],attributes:edge.label?{label:{kind:'text',value:edge.label}}:{}};
 }
 const document={documentId:'document:owner-'+name,schemaVersion:CURRENT_SCHEMA_VERSION,revision:1,profileRefs:['generic@2'],typeDefinitions:{},entities,relations,ports:{},resources:{},extensions:[]} as unknown as SemanticDocument;
 const presentation={contractPin:DIAGRAM_PRESENTATION_CONTRACT_PIN,entities:forms,legends:{},categoryTokens:[]} as DiagramPresentation;
 return {document,presentation,registry:m3ProfileRegistry,bindings:shippedExecutorBindings,
  measureLines:cardLineMeasurer(sceneCardMeasure(defaultCardMeasure)),
  collapsed:fixture.cards.filter(card=>card.container&&(folded??card.folded)).map(card=>occurrenceRef('e.'+card.id)),
  hints:{rootOrder,ordering}};
}
