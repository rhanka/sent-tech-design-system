import { expect, vi } from "vitest";
import { fireEvent } from "@testing-library/dom";
import { flowHitSize } from "@sentropic/diagram-canvas/flowModel";
import { DEFAULT_FLOW_TOKENS } from "@sentropic/diagram-canvas";
import { flowFixture, flowMeasure } from "../../test-support/flowFixture.js";
import type { FlowHostCase } from "../../test-support/flowHostCases.js";
import type { DiagramSceneFigureProps } from "@sentropic/diagram-canvas/diagramSceneModel";
export interface HostView { container: HTMLElement; rerender: (props: Partial<DiagramSceneFigureProps>) => Promise<unknown> }
export type HostMount = (props: DiagramSceneFigureProps) => HostView;
/** Compare the complete scene and flow navigator, including descriptions, geometry and accessible state. */
export function flowDomOf(container: HTMLElement): unknown {
 const tree=(element:Element|null):unknown=>{
  if(element===null)return null;
  const lucide=element.classList.contains("lucide");
  const attrs=Object.fromEntries([...element.attributes].filter((a)=>!["id","for"].includes(a.name)&&!(element.tagName==="SELECT"&&a.name==="value")&&!(lucide&&["width","height","style"].includes(a.name))).map((a)=>{
   let value=a.value;
   if(a.name==="aria-describedby")value="description";
   if(a.name==="class")value=value.split(/\s+/).filter((v)=>v&&!/^svelte-/.test(v)&&!(lucide&&["lucide-icon","lucide-plus-icon","lucide-minus-icon"].includes(v))).sort().join(" ");
   if(a.name==="style")value=value.split(";").map((v)=>v.trim()).filter(Boolean).map((v)=>v.replace(/\s*:\s*/,":")).sort().join(";");
   return [a.name,value];
  }).sort(([a],[b])=>a!.localeCompare(b!)));
  if(lucide){attrs["width"]=(element as SVGElement).style.width||element.getAttribute("width")!;attrs["height"]=(element as SVGElement).style.height||element.getAttribute("height")!;}
  const children=[...element.childNodes].flatMap((node)=>node.nodeType===1?[tree(node as Element)]:node.nodeType===3&&node.textContent?.trim()?[node.textContent.trim().replace(/\s+/g," ")]:[]);
  return {tag:element.tagName.toLowerCase(),attrs,children};
 };
 return {world:tree(container.querySelector(".st-diagramSceneFigure-world")),navigator:tree(container.querySelector(".st-diagramSceneFigure-flowNavigator")),zoom:container.querySelector("figure")?.getAttribute("data-zoom"),filter:(container.querySelector("select") as HTMLSelectElement|null)?.value};
}
export function propsFor(count=3,config:Parameters<typeof flowFixture>[1]={}):DiagramSceneFigureProps {
 const f=flowFixture(count,config);return {document:f.document,registry:f.options.registry,bindings:f.options.bindings,presentation:f.presentation,measureLines:flowMeasure};
}
export async function runFlowHostCase(test:FlowHostCase,mount:HostMount,tick:()=>Promise<unknown>):Promise<HostView>{
  const props=propsFor(test.count??3,{...(test.internal?{self:true}:{}),...(test.scenarios?{scenarios:true}:{}),...(test.folded?{folded:true}:{})}),step=vi.fn(),highlight=vi.fn(),select=vi.fn(),scenarioChange=vi.fn();
  // Fold isolation starts with a bundle before collapsing. Request it
  // explicitly instead of depending on a particular routing obstruction.
  const view=mount({...props,flows:{fanOutMax:test.bundle||test.folded?1:4},...(test.controlled?{activeStep:test.activeStep??null}:{}),...(test.omitted?{measureLines:(request:Parameters<typeof flowMeasure>[0])=>({...flowMeasure(request),width:request.role==="flow-badge"?50000:flowMeasure(request).width})}:{}),...(test.controlledScenario?{scenario:null}:{}),onStepChange:step,onScenarioChange:scenarioChange,onHighlightChange:highlight,onSelect:select});
  await tick();expect(step).not.toHaveBeenCalled();expect(highlight).not.toHaveBeenCalled();expect(scenarioChange).not.toHaveBeenCalled();
  const viewport=view.container.querySelector<HTMLElement>(".st-diagramSceneFigure-viewport")!;
  const target=(name="viewport"):HTMLElement=>{
   const [kind,index="0"]=name.split(":");const selector=kind==="badge"?"[data-flow-badge]":kind==="node"?"[data-flow-node]":kind==="edge"?"[data-flow-hit]":kind==="card"?"[data-scene-occurrence] .st-diagramCard":undefined;
   if(kind==="field"||kind==="editable"){const field=document.createElement(kind==="field"?"input":"div");if(kind==="editable")field.setAttribute("contenteditable","true");viewport.append(field);return field;}
   if(kind==="toggle")return view.container.querySelector<HTMLElement>("button[aria-expanded]")!;
   if(selector)return view.container.querySelectorAll<HTMLElement>(selector)[Number(index)]!;
   if(kind==="next"||kind==="previous")return [...view.container.querySelectorAll<HTMLElement>(".st-diagramSceneFigure-flowNavigator button")].find((e)=>e.textContent?.includes(kind==="next"?"Next":"Previous"))!;
   return viewport;
  };
  for(const event of test.events){
   const element=target(event.target);expect(element,"missing "+event.target).toBeDefined();
   if(event.type==="click")await fireEvent.click(element);
   else if(event.type==="over")await fireEvent.pointerOver(element);
   else if(event.type==="out")await fireEvent.pointerOut(element,{relatedTarget:viewport});
   else if(event.type==="focus")element.focus();
   else if(event.type==="blur")element.blur();
   else if(event.type==="key")await fireEvent.keyDown(element,{key:event.key,ctrlKey:event.modified??false});
   else if(event.type==="filter")await fireEvent.change(view.container.querySelector("select")!,{target:{value:"scenario:"+event.value}});
   else if(event.type==="prop")await view.rerender({activeStep:event.value??null});
   else if(event.type==="scenario-prop")await view.rerender({scenario:event.value??null});
   else if(event.type==="remove"){
    const relations=event.value==="all"?{}:{...props.document.relations};if(event.value!=="all")delete relations[event.value!];
    await view.rerender({document:{...props.document,revision:2,relations}});await tick();await tick();
   }
   else if(event.type==="pan"){
    for(const [type,x]of [["pointerdown",0],["pointermove",20],["pointerup",20]]as const){const pointer=new Event(type,{bubbles:true});Object.defineProperties(pointer,{pointerId:{value:1},pointerType:{value:"touch"},clientX:{value:x},clientY:{value:0}});element.dispatchEvent(pointer);}
    await fireEvent.click(element,{detail:1});
   }
   else if(event.type==="zoom")await fireEvent.wheel(viewport,{ctrlKey:true,deltaY:-100});
   await tick();
  }
  const expected=test.expect;
  const changes:Record<string,readonly (string|null)[]>={
   "step-activate":["z"],"step-toggle":["z",null],"edge-activate":["x"],"hover-leave-selection":["z"],"focus-selection-precedence":["z"],
   next:["z"],previous:["x"],"navigator-next":["z"],"navigator-previous":["x"],"node-activate":[null],"card-activate":[null],
   "bundle-member-walk":["z","x","y"],"internal-next":["z","y"],"internal-identity":["z","y"],"omitted-next":["z"],
   "filter-selection":["z",null],"controlled-waits":["z"],"controlled-node":[null],"removed-hover":["y"],"removed-selection":["z",null],"controlled-removed-selection":[null],
   "empty-tap":["z",null],"pan-then-keyboard":["z"],"enter-activate":["z"],"space-activate":["z"],"fold-toggle-isolation":["z"],
   "controlled-next-waits":["z"],"controlled-next-accepted":["z"],
  };
  expect(step.mock.calls).toEqual((changes[test.id]??[]).map((id)=>{
   if(id===null)return [null];
   const index=122-id.charCodeAt(0),scenario=test.scenarios?(index%2?"entity:s2":"entity:s1"):"";
   const visible=test.internal?{kind:"box",occurrence:"occurrence:e.a"}:test.folded?{kind:"bundle",id:"flow:occurrence:e.a|occurrence:e.outside|solid"}:test.bundle||test.omitted?{kind:"bundle",id:"flow:occurrence:e.a|occurrence:e.b|solid"}:{kind:"edge",occurrence:"occurrence:r."+id};
   return [{relation:"relation:"+id,scenario,ordinal:test.scenarios?Math.floor(index/2):index,visible}];
  }));
  if(expected.selected!==undefined){
   const relation=expected.selected, index=relation===null?-1:122-relation.charCodeAt(relation.length-1);
   expect(view.container.querySelector('.st-diagramSceneFigure-flowNavigator output[aria-label="Step"]')?.textContent?.trim()??"").toBe(relation===null?"":"Step "+(index+1));
   const pressed=[...view.container.querySelectorAll<HTMLElement>('[data-flow-badge][aria-pressed="true"]')].map((b)=>b.dataset["flowBadge"]);
   expect(pressed).toEqual(relation===null||test.internal||test.omitted?[]:[test.bundle?"occurrence:r.z":"occurrence:r."+relation!.slice(-1)]);
  }
  if(expected.filter!==undefined)expect((view.container.querySelector("select") as HTMLSelectElement).value).toBe(expected.filter===null?"all":"scenario:"+expected.filter);
  if(expected.scenarioChanges!==undefined)expect(scenarioChange.mock.calls).toEqual(expected.scenarioChanges.map((value)=>[value]));
  if(expected.sets!==undefined){
   const ids=(state:string)=>[...view.container.querySelectorAll('[data-scene-edge][data-flow-state="'+state+'"],[data-scene-occurrence][data-flow-state="'+state+'"]')].map((e)=>e.getAttribute("data-scene-edge")??e.getAttribute("data-scene-occurrence")).sort();
   expect(ids("primary")).toEqual([...expected.sets.primary].sort());expect(ids("related")).toEqual([...expected.sets.related].sort());expect(ids("dim")).toEqual([...expected.sets.dimmed].sort());
  }
  if(expected.primary)expect(view.container.querySelector(`[data-flow-state="primary"][data-scene-edge="${expected.primary}"],[data-flow-state="primary"][data-scene-occurrence="${expected.primary}"]`)).not.toBeNull();
  if(expected.noHighlight)expect(view.container.querySelector("[data-flow-active]")).toBeNull();
  if(expected.stepCalls!==undefined)expect(step).toHaveBeenCalledTimes(expected.stepCalls);
  if(expected.highlightCalls!==undefined)expect(highlight).toHaveBeenCalledTimes(expected.highlightCalls);
  if(test.id==="fold-toggle-isolation")expect(select).not.toHaveBeenCalled();
  if(expected.folded!==undefined)expect(view.container.querySelector("button[aria-expanded]")?.getAttribute("aria-expanded")).toBe(expected.folded?"false":"true");
  if(expected.tabStop)expect(target(expected.tabStop).getAttribute("tabindex")).toBe("0");
  if(expected.focus)expect(document.activeElement).toBe(target(expected.focus));
  if(expected.badges!==undefined)expect(view.container.querySelectorAll("[data-flow-badge]")).toHaveLength(expected.badges);
  if(expected.live!==undefined)expect(view.container.querySelector('output[aria-live="polite"].st-diagramSceneFigure-flowDescription')?.textContent).toBe(expected.live);
  for(const selector of ["[data-flow-badge]","[data-flow-node]"])if(view.container.querySelector(selector))expect(view.container.querySelectorAll(selector+'[tabindex="0"]')).toHaveLength(1);
  expect(view.container.querySelector("button button")).toBeNull();
  const zoom=Number(view.container.querySelector("figure")!.getAttribute("data-zoom"));if(view.container.querySelector(".st-diagramSceneFigure-flowNavigator"))expect(Number.parseFloat(viewport.style.getPropertyValue("--st-diagramSceneFigure-flowHit"))).toBe(flowHitSize(zoom,DEFAULT_FLOW_TOKENS));
  return view;
}
