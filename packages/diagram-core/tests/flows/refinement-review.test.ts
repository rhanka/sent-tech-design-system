import{describe,expect,it}from"vitest";
import{CURRENT_SCHEMA_VERSION,DIAGRAM_PRESENTATION_CONTRACT_PIN,createView,viewRef,occurrenceRef,validateDocument,validateView,defaultProfileRegistry,text,type ViewDocument}from"../../src/index.js";
import{baseDocument,ent,rel,validGeneric2Document,scopedOptions}from"../m3-helpers.js";
import{generic2Profile}from"../../src/index.js";
describe("DC-2c relation refinement review regressions",()=>{
 it("inherits hierarchy cycle checks",()=>{
  const document={...baseDocument(["generic@1"]),typeDefinitions:{nest:{id:"nest",profile:"generic@1" as const,baseType:"contains",attributes:[]}},entities:Object.fromEntries(["a","b"].map((id)=>["entity:"+id,ent(id,"generic@1","container",{name:text(id)})])),relations:Object.fromEntries([["a","b"],["b","a"]].map(([from,to],i)=>{const relation=rel(String(i),"generic@1","nest",[{role:"parent",target:"entity:"+from},{role:"child",target:"entity:"+to}]);return[relation.id,relation];}))};
  expect(validateDocument(document,{registry:defaultProfileRegistry}).map((d)=>d.code)).toContain("hierarchy-cycle");
 });
 it("resolves refined containment before the frozen presentation adapter without changing its bytes",()=>{
  const document=validGeneric2Document(),options=scopedOptions([generic2Profile]);
  const forms={l:"legend",k1:"legend-key",k2:"legend-key",c:"container",n:"card"}as const;
  const view:ViewDocument={...createView({viewId:viewRef("refined"),semanticDocumentId:document.documentId}),revision:document.revision,entityOccurrences:Object.fromEntries(Object.keys(forms).map((id)=>["occurrence:"+id,{id:occurrenceRef(id),entity:document.entities["entity:"+id]!.id,geometry:{x:0,y:0,width:460,height:200}}])),presentation:{camera:{x:0,y:0,zoom:1},diagram:{contractPin:{...DIAGRAM_PRESENTATION_CONTRACT_PIN},entities:Object.fromEntries(Object.entries(forms).map(([id,form])=>["occurrence:"+id,{form,text:{title:id}}])),legends:{"occurrence:l":{order:[document.entities["entity:k1"]!.id,document.entities["entity:k2"]!.id]}},categoryTokens:[]}}};
  expect(validateView(view,document,options)).toEqual([]);
  const refined={...document,typeDefinitions:{nest:{id:"nest",profile:"generic@2" as const,baseType:"contains",attributes:[]}},relations:Object.fromEntries(Object.entries(document.relations).map(([id,r])=>[id,{...r,type:"nest"}]))};
  expect(validateDocument(refined,options)).toEqual([]);expect(validateView(view,refined,options)).toEqual([]);
 });
});
