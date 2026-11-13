import { CURRENT_SCHEMA_VERSION, DIAGRAM_PRESENTATION_CONTRACT_PIN, m3ProfileRegistry, shippedExecutorBindings, withFlowTypes, type SemanticDocument, type Relation, type Entity } from "@sentropic/diagram-core";
import type { LayoutOptions, LineMeasurer } from "@sentropic/diagram-canvas";
export const flowMeasure: LineMeasurer = Object.assign((request: Parameters<LineMeasurer>[0])=>({lines:[request.text],width:request.text.length*8,height:request.role==="flow-badge"?20:24,overflow:false}),{version:"flow-fixture-v1"});
export function flowFixture(count=4, config:{folded?:boolean;self?:boolean;reverse?:boolean;labels?:boolean;scenarios?:boolean}={}) {
  const locals=config.folded?["zone","a","b","outside"]:["a","b"];
  const entities:Record<string,Entity>=Object.fromEntries(locals.map((id)=>["entity:"+id,{id:("entity:"+id) as Entity["id"],profile:"generic@2",type:id==="zone"?"container":"node",attributes:{name:{kind:"text",value:id}}}]));
  if(config.scenarios)for(const id of ["s1","s2"])entities["entity:"+id]={id:("entity:"+id) as Entity["id"],profile:"generic@2",type:"flow-scenario",attributes:{name:{kind:"text",value:id}}};
  const relations:Record<string,Relation>={};
  if(config.folded)for(const child of ["a","b"]){const id="relation:contains."+child;relations[id]={id:id as Relation["id"],profile:"generic@2",type:"contains",attributes:{},endpoints:[{role:"parent",target:"entity:zone" as never},{role:"child",target:("entity:"+child) as never}]};}
  for(let i=0;i<count;i++){
    const id="relation:"+String.fromCharCode(122-i);
    const source=config.folded?i===count-1&&config.reverse?"outside":"a":i===count-1&&config.reverse?"b":"a";
    const target=config.self?source:config.folded?i===count-1&&config.reverse?"a":"outside":i===count-1&&config.reverse?"a":"b";
    relations[id]={id:id as Relation["id"],profile:"generic@2",type:"flow-step",endpoints:[{role:"source",target:("entity:"+source) as never},{role:"target",target:("entity:"+target) as never}],attributes:{step:{kind:"quantity",value:i+1,unit:"unit"},...(config.labels?{label:{kind:"text" as const,value:"Message "+String(i+1)}}:{}),...(config.scenarios?{scenario:{kind:"reference" as const,value:i%2===0?"entity:s1":"entity:s2"}}:{})}};
  }
  const document=withFlowTypes({documentId:"document:flows" as SemanticDocument["documentId"],schemaVersion:CURRENT_SCHEMA_VERSION,revision:1,profileRefs:["generic@2"],typeDefinitions:{},entities,relations,ports:{},resources:{},extensions:[]}).document;
  const presentation={contractPin:{...DIAGRAM_PRESENTATION_CONTRACT_PIN},entities:Object.fromEntries(locals.map((id)=>["occurrence:e."+id,{form:id==="zone"?"container" as const:"card" as const,text:{title:id}}])),legends:{},categoryTokens:[]};
  const options:LayoutOptions={registry:m3ProfileRegistry,bindings:shippedExecutorBindings,presentation,measureText:(text)=>({width:text.length*8,height:24}),measureLines:flowMeasure,targetWidth:1440,flows:{fanOutMax:4}};
  return {document,options,presentation};
}
