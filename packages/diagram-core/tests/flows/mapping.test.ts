import{describe,expect,it}from"vitest";
import{flowIndex,validateDocument,validateFlows,withFlowTypes,text,quantity,reference,defaultProfileRegistry,type Relation}from"../../src/index.js";
import{baseDocument,ent,rel}from"../m3-helpers.js";
import{mappingCases}from"./mapping.js";
describe("DC-2c A4 BPMN mapping facts",()=>{
 for(const fixture of mappingCases)it(fixture.name,()=>{
  const entities=Object.fromEntries([...new Set(fixture.facts.map(([,executor])=>executor))].map((id)=>["entity:"+id,ent(id,"generic@1","node",{name:text(id)})]));
  const relations=Object.fromEntries(fixture.steps.map(([step,branch,source,target,task],i)=>{const r=rel(String(i),"generic@1","flow-step",[{role:"source",target:"entity:"+source},{role:"target",target:"entity:"+target}],{step:quantity(step,"unit"),...(branch?{branch:text(branch)}:{}),realises:text("bpmn:process#"+task)});return[r.id,r];}));
  const document=withFlowTypes({...baseDocument(["generic@1"]),entities,relations}).document;
  expect(validateDocument(document,{registry:defaultProfileRegistry})).toEqual([]);expect(validateFlows(document)).toEqual([]);
  const steps=Object.values(flowIndex(document).byRelation);
  for(const[task,executor]of fixture.facts){const matches=steps.filter((s)=>s.realises==="bpmn:process#"+task);expect(matches.length).toBeGreaterThanOrEqual(1);expect(matches.every((s)=>s.target==="entity:"+executor)).toBe(true);}
  expect(steps.every((s)=>s.kind===undefined)).toBe(true);
  if(fixture.name==="diamond-join"){expect(steps.map((s)=>s.badge)).toContain("3a");expect(steps.map((s)=>s.badge)).toContain("3b");expect(steps.filter((s)=>s.realises==="bpmn:process#join")).toHaveLength(2);}
 });
 it("models multiple starts as separate scenarios, with implicit scenario first and explicit order respected",()=>{
  const document=withFlowTypes({...baseDocument(["generic@1"]),entities:{"entity:a":ent("a","generic@1","node",{name:text("A")}),"entity:s1":ent("s1","generic@1","flow-scenario",{name:text("First"),order:quantity(2,"unit")}),"entity:s2":ent("s2","generic@1","flow-scenario",{name:text("Second"),order:quantity(1,"unit")})},relations:Object.fromEntries(["", "entity:s1","entity:s2"].map((scenario,i)=>{const r:Relation=rel(String(i),"generic@1","flow-step",[{role:"source",target:"entity:a"},{role:"target",target:"entity:a"}],{step:quantity(1,"unit"),...(scenario?{scenario:reference(scenario)}:{})});return[r.id,r];}))}).document;
  expect(validateFlows(document)).toEqual([]);expect(flowIndex(document).scenarios.map((s)=>s.id)).toEqual(["","entity:s2","entity:s1"]);
 });
});
