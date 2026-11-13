import { describe,expect,it } from "vitest";
import { layoutDocument,layoutMeasured,layoutFolded,createLayoutCache,relationRoute,rectsIntersect, type LayoutResult } from "../../src/index.js";
import { flowFixture } from "../../test-support/flowFixture.js";
import { resolveScene } from "../../src/presentation/diagramSceneModel.js";
import { permuteFlowRuns } from "../../src/layout/flow-order.js";
import { DEFAULT_FLOW_TOKENS } from "../../src/layout/flows.js";
import { diagnoseLabels } from "../../src/layout/engine.js";
const laid=(result:LayoutResult)=>{expect(result.status,JSON.stringify(result)).toBe("laid-out");if(result.status!=="laid-out")throw Error("refused");return result;};
describe("DC-2c A1, A5–A10 flow layout",()=>{
 for (const invalid of ["missing", "duplicate"] as const) it("refuses "+invalid+" step numbering in compatibility layout and diagnosis",()=>{
  const f=flowFixture(2);
  const document={...f.document,profileRefs:["generic@1" as const],entities:Object.fromEntries(Object.entries(f.document.entities).map(([id,e])=>[id,{...e,profile:"generic@1" as const}])),relations:Object.fromEntries(Object.entries(f.document.relations).map(([id,r])=>[id,{...r,profile:"generic@1" as const,attributes:invalid==="missing"?{}:{...r.attributes,step:{kind:"quantity" as const,value:1,unit:"unit"}}}])),typeDefinitions:Object.fromEntries(Object.entries(f.document.typeDefinitions).map(([id,d])=>[id,{...d,profile:"generic@1" as const}]))};
  const {presentation: _presentation,...options}=f.options;
  for(const run of [layoutDocument,diagnoseLabels]){
   const result=run(document,options);
   expect(result.status).toBe("refused");
   if(result.status!=="refused")throw Error("invalid flow accepted");
   expect(result.diagnostics.map((d)=>d.code)).toContain(invalid==="missing"?"flow-step-missing":"flow-step-duplicate");
  }
 });
 it("lays out refined links in both engines; compatibility warns; summaries and scene resolve",()=>{
  const f=flowFixture(1); const result=laid(layoutMeasured(f.document,f.options));
  expect(Object.keys(result.flowTargets!)).toHaveLength(1);expect(result.arrowBoxes!["occurrence:r.z"]).toHaveLength(1);
  const legacy=flowFixture(1);const oldDocument={...legacy.document,profileRefs:["generic@1" as const],entities:Object.fromEntries(Object.entries(legacy.document.entities).map(([id,e])=>[id,{...e,profile:"generic@1" as const}])),relations:Object.fromEntries(Object.entries(legacy.document.relations).map(([id,r])=>[id,{...r,profile:"generic@1" as const}])),typeDefinitions:Object.fromEntries(Object.entries(legacy.document.typeDefinitions).map(([id,d])=>[id,{...d,profile:"generic@1" as const}]))};
  const old=laid(layoutDocument(oldDocument,{...f.options,presentation:undefined as never}));expect(old.warnings.map((w)=>w.code)).toContain("flow-layout-unsupported");
  const scene=resolveScene(result,{document:f.document,presentation:f.presentation,measureLines:f.options.measureLines!});expect(scene.edges[0]!.directed).toBe(true);
 });
 it("permutes only run positions, leaving a mixed ordinary request in place",()=>{
  const sequence=[{id:"a",rank:2},{id:"m"},{id:"z",rank:1}];
  expect(permuteFlowRuns(sequence,(e)=>e.rank===undefined?undefined:"run",(e)=>e.rank!).map((e)=>e.id)).toEqual(["z","m","a"]);
  expect(permuteFlowRuns(sequence,(e)=>e.rank===undefined?undefined:"run",(e)=>e.rank!,()=>true).map((e)=>e.id)).toEqual(["a","m","z"]);
 });
 it("groups five steps above cap into one carrier with all logical targets",()=>{
  const f=flowFixture(5),result=laid(layoutMeasured(f.document,f.options));
  expect(result.flowBundles).toHaveLength(1);expect(result.flowBundles![0]).toMatchObject({reason:"fan-out",carrier:"occurrence:r.z",forward:5,backward:0});
  expect(result.flowBundles![0]!.members.map((m)=>m.relation)).toEqual(["relation:z","relation:y","relation:x","relation:w","relation:v"]);
  expect(Object.keys(result.flowTargets!)).toHaveLength(5);expect(Object.values(result.view.relationOccurrences).filter((r)=>r.waypoints!==undefined)).toHaveLength(1);
 });
 it("folds opposite directions with original ends and reuses an identical expanded result",()=>{
  const f=flowFixture(4,{folded:true,reverse:true}),cache=createLayoutCache();
  const expanded=laid(cache.layout(f.document,f.options));
  const folded=laid(cache.layoutFolded(f.document,expanded.view,{...f.options,collapsed:["occurrence:e.zone" as never]}));
  expect(folded.flowBundles![0]).toMatchObject({reason:"fold",forward:3,backward:1});
  expect(folded.arrowBoxes![folded.flowBundles![0]!.carrier]).toHaveLength(2);
  expect(folded.flowBundles![0]!.members[0]).toMatchObject({source:"entity:a",target:"entity:outside"});
  expect(cache.layout(f.document,f.options)).toBe(expanded);
 });
 it("folds four external edges and a cross-child step, then restores all four external routes",()=>{
  const f=flowFixture(4,{folded:true,reverse:true});
  const relations=Object.fromEntries(Object.entries(f.document.relations).map(([id,r])=>[id,r.type!=="flow-step"?r:{...r,endpoints:r.endpoints.map((end)=>({...end,target:end.target==="entity:a"?"entity:b" as never:end.target}))}]));
  relations["relation:internal"]={...relations["relation:z"]!,id:"relation:internal" as never,attributes:{step:{kind:"quantity",value:5,unit:"unit"}},endpoints:[{role:"source",target:"entity:a" as never},{role:"target",target:"entity:b" as never}]};
  const document={...f.document,relations},cache=createLayoutCache(),expanded=laid(cache.layout(document,f.options));
  const external=["w","x","y","z"].map((id)=>"occurrence:r."+id);
  expect(external.filter((id)=>expanded.view.relationOccurrences[id]!.waypoints!==undefined)).toEqual(external);
  expect(expanded.flowBundles).toEqual([]);
  const folded=laid(cache.layoutFolded(document,expanded.view,{...f.options,collapsed:["occurrence:e.zone" as never]}));
  expect(folded.flowBundles).toHaveLength(1);expect(folded.flowBundles![0]).toMatchObject({reason:"fold",forward:3,backward:1});
  expect(folded.flowBundles![0]!.members.map((m)=>[m.source,m.target])).toEqual([["entity:b","entity:outside"],["entity:b","entity:outside"],["entity:b","entity:outside"],["entity:outside","entity:b"]]);
  expect(folded.flowTargets!["relation:internal"]).toEqual({kind:"internal",box:"occurrence:e.zone"});
  expect(cache.layout(document,f.options)).toBe(expanded);
 });
 it("keeps unfolded self steps internal without routes, arrows or badges",()=>{
  const f=flowFixture(2,{self:true}),result=laid(layoutMeasured(f.document,f.options));
  expect(Object.values(result.flowTargets!)).toEqual([{kind:"internal",box:"occurrence:e.a"},{kind:"internal",box:"occurrence:e.a"}]);
  expect(result.badgeBoxes).toEqual({});expect(result.arrowBoxes).toEqual({});
  expect(Object.values(result.view.relationOccurrences).every((r)=>r.waypoints===undefined)).toBe(true);
 });
 it("places non-overlapping marks before labels and omits impossible badges with one repair",()=>{
  const f=flowFixture(3,{labels:true}); const result=laid(layoutMeasured(f.document,{...f.options,flowTokens:{flowBadgeSize:50000}}));
  expect(result.flowRepairPasses).toBe(1);expect(result.flowBundles![0]!.reason).toBe("obstructed");
  expect(result.flowBundles![0]!.members).toHaveLength(3);expect(result.flowTargets!["relation:z"]).toMatchObject({kind:"bundle",badge:false});
  expect(result.warnings.some((w)=>w.code==="badge-unplaced")).toBe(true);
  const carrier=result.flowBundles![0]!.carrier;
  expect(Object.keys(result.badgeBoxes!)).toEqual([]);
  expect(Object.values(result.view.relationOccurrences).filter((r)=>r.waypoints!==undefined).map((r)=>r.id)).toEqual([carrier]);
  const route=relationRoute(result.view,carrier)!;
  expect(result.arrowBoxes![carrier]!.map((a)=>a.tip)).toEqual([route.at(-1)]);
  const centeredDock=(box:{x:number;y:number;width:number;height:number},point:{x:number;y:number})=>(point.x===box.x+box.width/2&&(point.y===box.y||point.y===box.y+box.height))||(point.y===box.y+box.height/2&&(point.x===box.x||point.x===box.x+box.width));
  expect(centeredDock(result.view.entityOccurrences["occurrence:e.a"]!.geometry,route[0]!)).toBe(true);expect(centeredDock(result.view.entityOccurrences["occurrence:e.b"]!.geometry,route.at(-1)!)).toBe(true);
  const singleton=flowFixture(1),omitted=laid(layoutMeasured(singleton.document,{...singleton.options,flowTokens:{flowBadgeSize:50000}}));
  expect(omitted.flowBundles).toEqual([]);expect(omitted.badgeBoxes).toEqual({});expect(omitted.flowTargets!["relation:z"]).toEqual({kind:"edge",occurrence:"occurrence:r.z",badge:false});
  expect(omitted.warnings.filter((w)=>w.code==="badge-unplaced").map((w)=>w.refs)).toEqual([["occurrence:r.z"]]);expect(relationRoute(omitted.view,"occurrence:r.z" as never)!.length).toBeGreaterThan(1);
  const normal=laid(layoutMeasured(f.document,f.options)); const boxes=[...Object.values(normal.badgeBoxes!),...Object.values(normal.labelBoxes!),...Object.values(normal.arrowBoxes!).flat().map((a)=>a.box)];
  for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++)expect(rectsIntersect(boxes[i]!,boxes[j]!)).toBe(false);
 });
 it("is deterministic and keys flow geometry but never interaction state",()=>{
  const f=flowFixture(5),cache=createLayoutCache(); const first=laid(cache.layout(f.document,f.options));
  const second=laid(layoutMeasured({...f.document,relations:Object.fromEntries(Object.entries(f.document.relations).reverse())},f.options));expect(second).toEqual(first);expect(JSON.stringify(second)).toBe(JSON.stringify(first));
  cache.layout(f.document,{...f.options,flows:{fanOutMax:99}});cache.layout(f.document,{...f.options,flows:{countTemplate:"Flows {n}"}});cache.layout(f.document,{...f.options,flowTokens:{flowArrowLength:DEFAULT_FLOW_TOKENS.flowArrowLength+1}});
  cache.layout(f.document,{...f.options,flowTokens:{flowBadgeSize:DEFAULT_FLOW_TOKENS.flowBadgeSize+1}});
  expect(cache.stats().misses).toBe(5); expect(cache.layout(f.document,f.options)).toBe(first);
 });
 it("refuses duplicate flow occurrences and excludes absent steps from navigation",()=>{
  const f=flowFixture(1),result=laid(layoutMeasured(f.document,f.options)),r=result.view.relationOccurrences["occurrence:r.z"]!;
  expect(layoutFolded(f.document,{...result.view,relationOccurrences:{...result.view.relationOccurrences,"occurrence:duplicate":{...r,id:"occurrence:duplicate" as never}}},f.options).status).toBe("refused");
  const absent=laid(layoutFolded(f.document,{...result.view,relationOccurrences:{}},f.options));const scene=resolveScene(absent,{document:f.document,presentation:f.presentation,measureLines:f.options.measureLines!});expect(scene.flows.scenarios.flatMap((s)=>s.steps)).toEqual([]);
 });
});
