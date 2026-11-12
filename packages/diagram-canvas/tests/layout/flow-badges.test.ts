import{describe,expect,it}from"vitest";
import{layoutMeasured,rectsIntersect,type Rect}from"../../src/index.js";
import{placePackedLabel}from"../../src/layout/labels.js";
import{flowFixture}from"../../test-support/flowFixture.js";
const contains=(outer:Rect,inner:Rect)=>inner.x>=outer.x&&inner.y>=outer.y&&inner.x+inner.width<=outer.x+outer.width&&inner.y+inner.height<=outer.y+outer.height;
describe("DC-2c A8 marks and clipping",()=>{
 it("uses the first holding route segment while ordinary labels prefer longest",()=>{
  const entry={id:"badge",route:[{x:0,y:0},{x:120,y:0},{x:120,y:200}],size:{width:40,height:28}};
  expect(placePackedLabel({...entry,segmentOrder:"route-order"},[],[],4)?.segment).toBe(0);
  expect(placePackedLabel(entry,[],[],4)?.segment).toBe(1);
 });
 it("keeps the full badge inside within and limit at container and frame borders",()=>{
  const within={x:0,y:0,width:120,height:120},limit={x:0,y:0,width:100,height:100};
  for(const route of [[{x:0,y:0},{x:120,y:0}],[{x:0,y:50},{x:120,y:50}],[{x:100,y:0},{x:100,y:120}]]){
   const result=placePackedLabel({id:"badge",route,size:{width:40,height:28},within,limit,segmentOrder:"route-order"},[],[],4);
   if(result!==undefined){expect(contains(within,result.box)).toBe(true);expect(contains(limit,result.box)).toBe(true);}
  }
 });
 for(const countTemplate of ["{n} steps","Flows: {n}"])it("measures count template "+countTemplate+" and avoids nodes, arrows and labels",()=>{
  const f=flowFixture(5,{labels:true}),result=layoutMeasured(f.document,{...f.options,flows:{fanOutMax:4,countTemplate}});if(result.status!=="laid-out")throw Error("refused");
  const boxes=Object.values(result.badgeBoxes!);expect(boxes).toHaveLength(1);
  const obstacles=[...Object.values(result.view.entityOccurrences).map((n)=>n.geometry),...Object.values(result.arrowBoxes!).flat().map((a)=>a.box),...Object.values(result.labelBoxes!)];
  for(const box of boxes)for(const obstacle of obstacles)expect(rectsIntersect(box,obstacle)).toBe(false);
 });
 it("keeps 999z intact in a badge",()=>{
  const f=flowFixture(1),relation=f.document.relations["relation:z"]!,document={...f.document,relations:{...f.document.relations,[relation.id]:{...relation,attributes:{step:{kind:"quantity" as const,value:999,unit:"unit"},branch:{kind:"text" as const,value:"z"}}}}};
  const result=layoutMeasured(document,f.options);if(result.status!=="laid-out")throw Error("refused");expect(Object.values(result.badgeBoxes!)[0]!.width).toBeGreaterThanOrEqual(44);
 });
});
