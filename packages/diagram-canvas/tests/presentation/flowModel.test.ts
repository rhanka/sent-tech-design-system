import { describe,expect,it,vi } from "vitest";
import { flowFixture } from "../../test-support/flowFixture.js";
import { layoutMeasured,createLayoutCache } from "../../src/index.js";
import { resolveScene } from "../../src/presentation/diagramSceneModel.js";
import { INITIAL_FLOW_STATE,visibleOf,effectiveTarget,highlightOf,reduce,describeTarget,announce,flowHitSize,flowMarksSvg,type FlowState,type FlowAction } from "../../src/presentation/flowModel.js";
function fixture(count=3,config:Parameters<typeof flowFixture>[1]={}){const f=flowFixture(count,config),result=layoutMeasured(f.document,f.options);if(result.status!=="laid-out")throw Error(JSON.stringify(result));return {f,result,scene:resolveScene(result,{document:f.document,presentation:f.presentation,measureLines:f.options.measureLines!})};}
describe("DC-2c A11 shared flow model",()=>{
 it("uses hover > focus > selection and retains selected member identity on its own bundle",()=>{
  const {scene}=fixture(5,{scenarios:true});const bundle=scene.edges[0]!.bundle!,visible={kind:"bundle" as const,id:bundle.id};
  let state:FlowState={...INITIAL_FLOW_STATE,focus:visible};expect(effectiveTarget(scene,state)).toEqual({visible});
  state=reduce(scene,state,{type:"activate",target:visible}).state;expect(effectiveTarget(scene,state)).toEqual({visible,step:"relation:z"});
  const walked=reduce(scene,state,{type:"activate",target:visible});expect(walked.emit).toEqual(["step","highlight"]);expect(walked.state.selection).toEqual({kind:"step",relation:"relation:x"});
  const other={kind:"box" as const,occurrence:"occurrence:e.a"};expect(effectiveTarget(scene,{...state,hover:other})).toEqual({visible:other});
 });
 it("retains identity for two internal steps on one box, including same-box hover and focus",()=>{
  const {scene}=fixture(2,{self:true,scenarios:true});let state:FlowState={...INITIAL_FLOW_STATE,selection:{kind:"step",relation:"relation:z"}};
  expect(visibleOf(scene,state.selection)).toEqual({kind:"box",occurrence:"occurrence:e.a"});
  const before=effectiveTarget(scene,state);state=reduce(scene,state,{type:"next"}).state;
  expect(effectiveTarget(scene,state)).not.toEqual(before);expect(effectiveTarget(scene,state)?.step).toBe("relation:y");
  expect(effectiveTarget(scene,{...state,hover:{kind:"box",occurrence:"occurrence:e.a"}})?.step).toBe("relation:y");
  expect(effectiveTarget(scene,{...state,focus:{kind:"box",occurrence:"occurrence:e.b"}})?.step).toBeUndefined();
 });
 it("mutes Escape until the hover or focus identity changes",()=>{
  const {scene}=fixture();const visible=visibleOf(scene,{kind:"step",relation:"relation:z"})!;
  let state:FlowState={...INITIAL_FLOW_STATE,selection:{kind:"step",relation:"relation:z"},focus:visible};
  state=reduce(scene,state,{type:"escape"}).state;expect(effectiveTarget(scene,state)).toBeNull();
  state=reduce(scene,state,{type:"focus",target:visible}).state;expect(state.muted).toBe(true);
  state=reduce(scene,state,{type:"focus",target:null}).state;expect(state.muted).toBe(false);
 });
 it("clamps navigation, filters steps, toggles selection, and repairs removed steps",()=>{
  const {scene}=fixture(3,{scenarios:true});let state:FlowState={...INITIAL_FLOW_STATE};
  for(const action of [{type:"previous"},{type:"first"},{type:"last"},{type:"next"}] as FlowAction[])state=reduce(scene,state,action).state;
  expect(state.selection).toEqual({kind:"step",relation:"relation:y"});
  state=reduce(scene,state,{type:"scenario",id:"entity:s1"}).state;expect(state.selection).toBeNull();
  state=reduce(scene,state,{type:"next"}).state;expect(state.selection).toEqual({kind:"step",relation:"relation:z"});
  const target=visibleOf(scene,state.selection)!;expect(reduce(scene,state,{type:"activate",target}).state.selection).toBeNull();
  const removed={...scene,flowTargets:{},flows:{...scene.flows,byRelation:{}}};expect(reduce(removed,state,{type:"repair"}).emit).toContain("step");
  expect(announce(scene,state)).toContain("1");
 });
 it("computes edge, internal, node and filter-only sets without mutating descriptions",()=>{
  const {scene}=fixture(3,{scenarios:true});const state:FlowState={...INITIAL_FLOW_STATE,selection:{kind:"step",relation:"relation:z"}};
  const sets=highlightOf(scene,state);expect(sets.primary).toEqual(new Set(["occurrence:r.z","occurrence:e.a","occurrence:e.b"]));
  expect(sets.related).toContain("occurrence:r.x");expect(sets.dimmed).toContain("occurrence:r.y");
  expect(highlightOf(scene,INITIAL_FLOW_STATE).dimmed.size).toBe(0);
  expect(highlightOf(scene,{...INITIAL_FLOW_STATE,scenario:"entity:s1"}).dimmed).toContain("occurrence:r.y");
  const node=highlightOf(scene,{...INITIAL_FLOW_STATE,selection:{kind:"node",entity:"entity:a"}});expect(node.primary).toContain("occurrence:r.z");expect(node.related).toContain("occurrence:e.b");
  const visible=visibleOf(scene,state.selection)!;const text=describeTarget(scene,visible);for(const action of [{type:"scenario",id:"entity:s2"},{type:"next"},{type:"escape"}] as FlowAction[]){reduce(scene,state,action);expect(describeTarget(scene,visible)).toBe(text);}
 });
 it("renders static marks and preserves the token minimum target size at each zoom",()=>{
  const {scene}=fixture(1);const svg=flowMarksSvg(scene);expect(svg).toContain("data-flow-arrow");expect(svg).toContain(">1</text>");expect(svg).not.toContain("pulse");
  for(const zoom of [0.25,1,4])expect(flowHitSize(zoom)*zoom).toBeGreaterThanOrEqual(24);
 });
 it("performs 200 interactions with no layout, cache miss, timers or RAF",()=>{
  const {f,scene}=fixture();const cache=createLayoutCache();cache.layout(f.document,f.options);const before=cache.stats();
  const timeout=vi.spyOn(globalThis,"setTimeout"),interval=vi.spyOn(globalThis,"setInterval");let state:FlowState={...INITIAL_FLOW_STATE};
  for(let i=0;i<200;i++){state=reduce(scene,state,{type:i%2?"next":"previous"}).state;highlightOf(scene,state);describeTarget(scene,{kind:"box",occurrence:"occurrence:e.a"});}
  expect(cache.stats()).toEqual(before);expect(timeout).not.toHaveBeenCalled();expect(interval).not.toHaveBeenCalled();vi.restoreAllMocks();
 });
});
