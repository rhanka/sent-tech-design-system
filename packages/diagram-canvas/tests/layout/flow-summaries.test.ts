import{describe,expect,it}from"vitest";
import{resolveSummaries,validateView,type SummaryDefinition,type ViewDocument}from"@sentropic/diagram-core";
import{layoutMeasured,layoutFolded}from"../../src/index.js";
import{flowFixture}from"../../test-support/flowFixture.js";
import{resolveScene}from"../../src/presentation/diagramSceneModel.js";
import{describeTarget}from"../../src/presentation/flowModel.js";
function setup(mixed=false){
 const f=flowFixture(4,{folded:true,reverse:true});
 const original=f.document.relations["relation:z"]!;
 const document=mixed?{...f.document,relations:{...f.document.relations,"relation:link":{...original,id:"relation:link" as typeof original.id,type:"link",attributes:{}}}}:f.document;
 const result=layoutMeasured(document,f.options);if(result.status!=="laid-out")throw Error("refused");
 const forward=Object.values(document.relations).filter((r)=>r.type!=="contains"&&r.endpoints.find((e)=>e.role==="source")?.target==="entity:a").map((r)=>r.id).sort();
 const summaries:Record<string,SummaryDefinition>={forward:{id:"forward",sourceOccurrence:"occurrence:e.zone" as never,targetOccurrence:"occurrence:e.outside" as never,label:"Outbound summary",relationIds:forward},backward:{id:"backward",sourceOccurrence:"occurrence:e.outside" as never,targetOccurrence:"occurrence:e.zone" as never,label:"Inbound summary",relationIds:["relation:w" as never]}};
 const view:ViewDocument={...result.view,summaryLabels:summaries};
 return{...f,document,view};
}
describe("DC-2c A7 summary semantics",()=>{
 it("lists both directed summary ids and their labels only in bundle descriptions",()=>{
  const f=setup();const result=layoutFolded(f.document,f.view,{...f.options,collapsed:["occurrence:e.zone" as never]});if(result.status!=="laid-out")throw Error("refused");
  const bundle=result.flowBundles![0]!;expect(bundle.summaries).toEqual(["backward","forward"]);
  const scene=resolveScene(result,{document:f.document,presentation:f.presentation,measureLines:f.options.measureLines!});
  expect(describeTarget(scene,{kind:"bundle",id:bundle.id})).toContain("Outbound summary");expect(describeTarget(scene,{kind:"bundle",id:bundle.id})).toContain("Inbound summary");
  expect(scene.badges.every((b)=>!b.text.includes("summary"))).toBe(true);expect(scene.labels).toEqual([]);
 });
 it("keeps ordinary links beside a mixed summary and ignores fan-out settings in summary resolution",()=>{
  const f=setup(true);const results=[1,99].map((fanOutMax)=>layoutFolded(f.document,f.view,{...f.options,collapsed:["occurrence:e.zone" as never],flows:{fanOutMax}}));
  for(const result of results){if(result.status!=="laid-out")throw Error("refused");expect(result.view.relationOccurrences["occurrence:r.link"]!.waypoints).toBeDefined();expect(result.flowBundles![0]!.summaries).toEqual(["backward","forward"]);}
  const [a,b]=results;if(a!.status!=="laid-out"||b!.status!=="laid-out")throw Error("refused");expect(resolveSummaries(a!.view,f.document,{registry:f.options.registry})).toEqual(resolveSummaries(b!.view,f.document,{registry:f.options.registry}));
 });
 it("lists no conflicting summary and preserves the existing conflict diagnostic",()=>{
  const f=setup(),view={...f.view,summaryLabels:{...f.view.summaryLabels,duplicate:{...f.view.summaryLabels!["forward"]!,id:"duplicate",sourceOccurrence:"occurrence:e.a" as never}}};
  const result=layoutFolded(f.document,view,{...f.options,collapsed:["occurrence:e.zone" as never]});if(result.status!=="laid-out")throw Error("refused");
  expect(result.flowBundles![0]!.summaries).toEqual(["backward"]);
  expect(validateView(result.view,f.document,{registry:f.options.registry,bindings:f.options.bindings!}).some((d)=>d.details?.["check"]==="summary-active-key-conflict")).toBe(true);
 });
});
