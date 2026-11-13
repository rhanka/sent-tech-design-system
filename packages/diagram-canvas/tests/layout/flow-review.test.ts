import{describe,expect,it}from"vitest";
import{layoutMeasured,layoutFolded,type LayoutResult}from"../../src/index.js";
import{resolveScene}from"../../src/presentation/diagramSceneModel.js";
import{visibleOf,reduce,INITIAL_FLOW_STATE}from"../../src/presentation/flowModel.js";
import{flowFixture}from"../../test-support/flowFixture.js";
const laid=(r:LayoutResult)=>{if(r.status!=="laid-out")throw Error(JSON.stringify(r));return r;};
describe("DC-2c second-pass design regressions",()=>{
 it("suppresses all bundle labels, including the carrier's text",()=>{
  const f=flowFixture(5,{labels:true}),result=laid(layoutMeasured(f.document,f.options));expect(result.flowBundles).toHaveLength(1);expect(result.labelBoxes).toEqual({});expect(result.measurements!.slots.filter((s)=>s.role==="edge-label")).toEqual([]);
 });
 it("preserves logical node selection across fold/unfold",()=>{
  const f=flowFixture(2,{folded:true}),expanded=laid(layoutMeasured(f.document,f.options)),folded=laid(layoutFolded(f.document,expanded.view,{...f.options,collapsed:["occurrence:e.zone" as never]}));
  const scene=resolveScene(folded,{document:f.document,presentation:f.presentation,measureLines:f.options.measureLines!});
  const selection={kind:"node" as const,entity:"entity:a"};expect(visibleOf(scene,selection)).toEqual({kind:"box",occurrence:"occurrence:e.zone"});expect(reduce(scene,{...INITIAL_FLOW_STATE,selection},{type:"repair"}).state.selection).toEqual(selection);
  const original=resolveScene(expanded,{document:f.document,presentation:f.presentation,measureLines:f.options.measureLines!});expect(visibleOf(original,selection)).toEqual({kind:"box",occurrence:"occurrence:e.a"});
 });
 it("refuses authored scenario occurrences",()=>{
  const f=flowFixture(2,{scenarios:true}),result=laid(layoutMeasured(f.document,f.options));
  const source={...result.view,entityOccurrences:{...result.view.entityOccurrences,"occurrence:s1":{id:"occurrence:s1" as never,entity:"entity:s1" as never,geometry:{x:0,y:0,width:460,height:200}}}};
  expect(layoutFolded(f.document,source,f.options).status).toBe("refused");
 });
 it("applies base and authored relation-type filters to a mixed view",()=>{
  const f=flowFixture(1),step=f.document.relations["relation:z"]!;
  const document={...f.document,relations:{...f.document.relations,"relation:plain":{...step,id:"relation:plain" as typeof step.id,type:"link",attributes:{}}}};
  const result=laid(layoutMeasured(document,f.options));
  for(const types of [["link"],["flow-step"]]){
   const filtered=laid(layoutFolded(document,{...result.view,filters:[{id:"filter",kind:"relation-type",mode:"exclude",types}]},f.options));
   const scene=resolveScene(filtered,{document,presentation:f.presentation,measureLines:f.options.measureLines!});expect(scene.edges.map((e)=>e.flow?.relation)).not.toContain("relation:z");expect(Object.keys(scene.flowTargets)).toHaveLength(0);if(types[0]==="link")expect(scene.edges).toEqual([]);else expect(scene.edges).toHaveLength(1);
  }
 });
 it("keeps pre-flow geometry on hidden ordinary links",()=>{
  const f=flowFixture(1,{folded:true}),step=f.document.relations["relation:z"]!;
  const document={...f.document,relations:{...f.document.relations,[step.id]:{...step,type:"link",attributes:{},endpoints:[{role:"source",target:"entity:a" as never},{role:"target",target:"entity:b" as never}]}}};
  const expanded=laid(layoutMeasured(document,f.options)),folded=laid(layoutFolded(document,expanded.view,{...f.options,collapsed:["occurrence:e.zone" as never]}));
  expect(folded.view.relationOccurrences["occurrence:r.z"]!.waypoints).toEqual(expanded.view.relationOccurrences["occurrence:r.z"]!.waypoints);
 });
});
