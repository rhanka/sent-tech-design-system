import{describe,expect,it}from"vitest";
import{DEFAULT_LAYOUT_METRICS,parallelRelations}from"../../src/index.js";
import{dockEdges}from"../../src/layout/dock.js";
import{routeEdges,routesConflict}from"../../src/layout/route.js";
import type{LayoutGraph}from"../../src/layout/graph.js";
const a="entity:a" as never,b="entity:b" as never;
const ids=["relation:a","relation:m","relation:z"] as const;
const graph:LayoutGraph={nodes:new Map(),roots:[a,b],edges:ids.map((id,i)=>({id:id as never,source:{entity:a},target:{entity:b},...(i===1?{}:{flowRank:i===0?1:0})}))};
describe("DC-2c A5 docking and routing permutations",()=>{
 it("keeps a mixed link slot fixed and puts reversed ids into flow order on facing sides",()=>{
  const rects=new Map([[a,{x:0,y:0,width:460,height:200}],[b,{x:800,y:0,width:460,height:200}]]);
  const docked=dockEdges({graph,rects,direction:"left-to-right",metrics:DEFAULT_LAYOUT_METRICS,labelSizes:new Map(),fixed:true,flowBadgeSize:28});
  for(const role of ["source","target"]as const)expect([...docked.docks].sort(([,x],[,y])=>x[role].order-y[role].order).map(([id])=>id)).toEqual(["relation:z","relation:m","relation:a"]);
  const requests=graph.edges.map((edge)=>{const pair=docked.docks.get(edge.id)!;return{id:edge.id,pairKey:"pair",passable:new Set<never>(),start:pair.source.point,startExit:pair.source.exit,end:pair.target.point,endExit:pair.target.exit,...(edge.flowRank===undefined?{}:{flowRank:edge.flowRank,flowRun:"pair"})};});
  const routed=routeEdges({rects,requests,clearance:8});expect(routed.obstructed).toEqual([]);
  const routes=[...routed.routes.values()];for(let i=0;i<routes.length;i++)for(let j=i+1;j<routes.length;j++)expect(routesConflict(routes[i]!,routes[j]!)).toBe(false);
  expect([...parallelRelations(graph)]).toEqual(ids);
 });
 for(const position of [800,-800])it("preserves existing U-channel reversal at other-end x="+position,()=>{
  const rects=new Map([[a,{x:0,y:0,width:460,height:200}],[b,{x:position,y:0,width:460,height:200}]]);
  const sideOverrides=new Map(ids.map((id)=>[id as never,{source:"south" as const,target:"south" as const,turn:true}]));
  const result=dockEdges({graph,rects,direction:"left-to-right",metrics:DEFAULT_LAYOUT_METRICS,labelSizes:new Map(),fixed:true,sideOverrides,flowBadgeSize:28});
  const source=[...result.docks].sort(([,x],[,y])=>x.source.order-y.source.order).map(([id])=>id);
  expect(source).toEqual(position>0?["relation:a","relation:m","relation:z"]:["relation:z","relation:m","relation:a"]);
  expect([...result.docks].sort(([,x],[,y])=>x.target.order-y.target.order).map(([id])=>id)).toEqual(position>0?["relation:z","relation:m","relation:a"]:["relation:a","relation:m","relation:z"]);
  const requests=graph.edges.map((edge)=>{const pair=result.docks.get(edge.id)!;return{id:edge.id,pairKey:"pair",passable:new Set<never>(),start:pair.source.point,startExit:pair.source.exit,end:pair.target.point,endExit:pair.target.exit,...(edge.flowRank===undefined?{}:{flowRank:edge.flowRank,flowRun:"pair"})};});
  // As in the measured path, each nested U-channel has an outside lane.
  const route=(sequence:typeof requests)=>routeEdges({rects,requests:sequence,clearance:8,lanes:{xs:[],ys:[216,224]}});
  const routed=route(requests);expect([...routed.routes.keys()]).toEqual(["relation:z","relation:m","relation:a"]);expect(routed.obstructed).toEqual([]);
  const routes=[...routed.routes.values()];for(let i=0;i<routes.length;i++)for(let j=i+1;j<routes.length;j++)expect(routesConflict(routes[i]!,routes[j]!)).toBe(false);
  expect(route([...requests].reverse())).toEqual(routed);
 });
});

describe("DC-2c A5 shared slots",()=>{
 it("does not permute steps sharing an authored port slot",()=>{
  const shared={...graph,edges:graph.edges.map((edge)=>({...edge,source:{entity:a,port:"port:p" as never,slot:"occurrence:port"}}))};
  const rects=new Map([[a,{x:0,y:0,width:460,height:200}],[b,{x:800,y:0,width:460,height:200}]]);
  const result=dockEdges({graph:shared,rects,direction:"left-to-right",metrics:DEFAULT_LAYOUT_METRICS,labelSizes:new Map(),fixed:true,flowBadgeSize:28});
  expect(new Set([...result.docks.values()].map((dock)=>dock.source.order)).size).toBe(1);
  expect([...result.docks].sort(([,x],[,y])=>x.target.order-y.target.order).map(([id])=>id)).toEqual(ids);
 });
});

describe("DC-2c A5 four facing and opposite-direction steps",()=>{
 it("keeps K at both physical ends, avoids crossings and ignores input order",()=>{
  const edges=["z","y","x","w"].map((id,flowRank)=>({id:("relation:"+id) as never,flowRank,source:{entity:flowRank===3?b:a},target:{entity:flowRank===3?a:b}}));
  const rects=new Map([[a,{x:0,y:0,width:460,height:200}],[b,{x:800,y:0,width:460,height:200}]]);
  let previous:unknown;
  for(const ordered of [edges,[...edges].reverse()]){
   const current={...graph,edges:ordered};const docks=dockEdges({graph:current,rects,direction:"left-to-right",metrics:DEFAULT_LAYOUT_METRICS,labelSizes:new Map(),fixed:true,flowBadgeSize:28}).docks;
   for(const entity of [a,b])expect([...docks].sort(([,l],[,r])=>(l.source.entity===entity?l.source:l.target).order-(r.source.entity===entity?r.source:r.target).order).map(([id])=>id)).toEqual(["relation:z","relation:y","relation:x","relation:w"]);
   const requests=ordered.map((edge)=>{const pair=docks.get(edge.id)!;return{id:edge.id,flowRank:edge.flowRank,flowRun:"pair",pairKey:"pair",passable:new Set<never>(),start:pair.source.point,startExit:pair.source.exit,end:pair.target.point,endExit:pair.target.exit};});
   const routed=routeEdges({rects,requests,clearance:8});expect(routed.obstructed).toEqual([]);const routes=[...routed.routes.values()];for(let i=0;i<routes.length;i++)for(let j=i+1;j<routes.length;j++)expect(routesConflict(routes[i]!,routes[j]!)).toBe(false);
   const normalized=[...routed.routes].sort(([l],[r])=>l<r?-1:1);if(previous!==undefined)expect(normalized).toEqual(previous);previous=normalized;
  }
 });
});
