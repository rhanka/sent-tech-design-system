import { afterEach,beforeEach,describe,expect,it,vi } from "vitest";
import { cleanup,fireEvent,render } from "@testing-library/svelte";
import { tick } from "svelte";
import * as model from "@sentropic/diagram-canvas/diagramSceneModel";
import { createLayoutCache,DEFAULT_FLOW_TOKENS } from "@sentropic/diagram-canvas";
import { flowHitSize,type StepChange } from "@sentropic/diagram-canvas/flowModel";
import { flowHostCases } from "../../../diagram-canvas/dist-test-support/flowHostCases.js";
import { flowFixture,flowMeasure } from "../../../diagram-canvas/dist-test-support/flowFixture.js";
import DiagramSceneFigure,{type DiagramSceneFigureProps} from "./DiagramSceneFigure.svelte";

beforeEach(()=>{
 vi.stubGlobal("ResizeObserver",class {observe(){}disconnect(){}});
 vi.stubGlobal("MutationObserver",class {observe(){}disconnect(){}takeRecords(){return [];}});
 vi.stubGlobal("matchMedia",()=>({matches:true,addEventListener(){},removeEventListener(){}}));
 Object.defineProperty(HTMLElement.prototype,"clientWidth",{configurable:true,get:()=>1280});
});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();delete (HTMLElement.prototype as {clientWidth?:number}).clientWidth;});
function propsFor(count=3,config:Parameters<typeof flowFixture>[1]={}):DiagramSceneFigureProps{
 const f=flowFixture(count,config);return {document:f.document,registry:f.options.registry,bindings:f.options.bindings,presentation:f.presentation,measureLines:flowMeasure};
}
describe("DC-2c A12 shared host cases — Svelte",()=>{
 for(const test of flowHostCases)it(test.id+": "+test.note,async()=>{
  const props=propsFor(test.count??3,{self:test.internal,scenarios:test.scenarios,folded:test.folded}),step=vi.fn(),highlight=vi.fn(),select=vi.fn();
  const view=render(DiagramSceneFigure,{...props,flows:{fanOutMax:test.bundle?1:4},...(test.controlled?{activeStep:test.activeStep??null}:{}),...(test.omitted?{measureLines:(request:Parameters<typeof flowMeasure>[0])=>({...flowMeasure(request),width:request.role==="flow-badge"?50000:flowMeasure(request).width})}:{}),onStepChange:step,onHighlightChange:highlight,onSelect:select});
  await tick();expect(step).not.toHaveBeenCalled();expect(highlight).not.toHaveBeenCalled();
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
   else if(event.type==="prop")await view.rerender({activeStep:event.value});
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
  if(expected.selected!==undefined){
   const selected=expected.selected===null?undefined:expected.selected;
   if(!test.controlled||test.events.some((e)=>e.type==="prop")){
    const pressed=[...view.container.querySelectorAll<HTMLElement>('[data-flow-badge][aria-pressed="true"]')];
    if(selected===undefined)expect(pressed).toHaveLength(0);
    else if(!test.internal&&!test.omitted&&view.container.querySelector("[data-flow-badge]"))expect(pressed).toHaveLength(1);
   }
   if(!test.controlled&&expected.selected!==null)expect((step.mock.calls.at(-1)?.[0] as StepChange)?.relation).toBe(expected.selected);
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
  if(expected.live)expect(view.container.querySelector('output[aria-live="polite"].st-diagramSceneFigure-flowDescription')?.textContent).toContain(expected.live);
  for(const selector of ["[data-flow-badge]","[data-flow-node]"])if(view.container.querySelector(selector))expect(view.container.querySelectorAll(selector+'[tabindex="0"]')).toHaveLength(1);
  expect(view.container.querySelector("button button")).toBeNull();
  const zoom=Number(view.container.querySelector("figure")!.getAttribute("data-zoom"));if(view.container.querySelector(".st-diagramSceneFigure-flowNavigator"))expect(Number.parseFloat(viewport.style.getPropertyValue("--st-diagramSceneFigure-flowHit"))).toBe(flowHitSize(zoom,DEFAULT_FLOW_TOKENS));
 });
 it("keeps stable descriptions under selection/filter and repairs a removed selected relation once",async()=>{
  const props=propsFor(3,{scenarios:true}),step=vi.fn(),view=render(DiagramSceneFigure,{...props,onStepChange:step});await tick();
  const badge=view.container.querySelector<HTMLButtonElement>("[data-flow-badge]")!,id=badge.getAttribute("aria-describedby")!;
  const description=document.getElementById(id)!.textContent;
  await fireEvent.click(badge);await fireEvent.change(view.container.querySelector("select")!,{target:{value:"scenario:entity:s1"}});await tick();expect(document.getElementById(id)!.textContent).toBe(description);
  const relations={...props.document.relations};delete relations["relation:z"];
  await view.rerender({document:{...props.document,revision:2,relations}});await tick();expect(step.mock.calls.filter(([value])=>value===null)).toHaveLength(1);
  await view.rerender({title:"New title"});await tick();expect(step.mock.calls.filter(([value])=>value===null)).toHaveLength(1);
 });
 it("repairs disappearing badge and node focus to their group or viewport",async()=>{
  const props=propsFor(2),view=render(DiagramSceneFigure,props);await tick();
  const first=view.container.querySelector<HTMLButtonElement>("[data-flow-badge]")!;first.focus();await tick();
  const relations={...props.document.relations};delete relations["relation:z"];
  await view.rerender({document:{...props.document,revision:2,relations}});await tick();await tick();expect(document.activeElement).toBe(view.container.querySelector('[data-flow-badge][tabindex="0"]'));
  view.container.querySelector<HTMLButtonElement>("[data-flow-node]")!.focus();await tick();
  await view.rerender({document:{...props.document,revision:3,relations:{}}});await tick();await tick();expect(document.activeElement).toBe(view.container.querySelector(".st-diagramSceneFigure-viewport"));
 });
 it("runs 200 user changes without layout, scene, cache, timer or RAF work, then stays idle with selection retained",async()=>{
  const cache=createLayoutCache(),view=render(DiagramSceneFigure,{...propsFor(3,{scenarios:true}),layoutCache:cache});await tick();
  const layout=vi.spyOn(model,"layoutScene"),resolve=vi.spyOn(model,"resolveScene"),cached=vi.spyOn(cache,"layout"),timeout=vi.spyOn(globalThis,"setTimeout"),interval=vi.spyOn(globalThis,"setInterval"),raf=vi.spyOn(globalThis,"requestAnimationFrame");
  const viewport=view.container.querySelector<HTMLElement>(".st-diagramSceneFigure-viewport")!,badges=view.container.querySelectorAll<HTMLElement>("[data-flow-badge]");
  const before=cache.stats();

  for(let i=0;i<200;i++){if(i%5===0)await fireEvent.pointerOver(badges[0]!);else if(i%5===1)badges[1]!.dispatchEvent(new FocusEvent("focusin",{bubbles:true}));else if(i%5===2)await fireEvent.click(badges[0]!);else if(i%5===3)await fireEvent.change(view.container.querySelector("select")!,{target:{value:i%2?"scenario:entity:s1":"scenario:entity:s2"}});else await fireEvent.keyDown(viewport,{key:"]"});await tick();}
  expect(layout).not.toHaveBeenCalled();expect(resolve).not.toHaveBeenCalled();expect(cached).not.toHaveBeenCalled();expect(cache.stats()).toEqual(before);expect(timeout).not.toHaveBeenCalled();expect(interval).not.toHaveBeenCalled();expect(raf).not.toHaveBeenCalled();
  vi.useFakeTimers();await vi.advanceTimersByTimeAsync(60000);await tick();expect(layout).not.toHaveBeenCalled();expect(raf).not.toHaveBeenCalled();vi.useRealTimers();
 });
});

describe("DC-2c A13–A14 source discipline",()=>{
 it("keeps concealed node targets focusable and flow styles free of motion and visual literals",async()=>{
  const{readFileSync}=await import("node:fs");const{fileURLToPath}=await import("node:url");const source=readFileSync(fileURLToPath(import.meta.url).replace(/[^/]+$/,"DiagramSceneFigure.svelte"),"utf8");
  const rules=source.slice(source.indexOf("  .st-diagramSceneFigure-flowNavigator"),source.indexOf("  .st-diagramSceneFigure {"));
  expect(rules).not.toMatch(/visibility\s*:\s*hidden|display\s*:\s*none|transition\s*:|animation\s*:/);
  expect(rules).toContain("opacity: var(--st-component-diagramScene-flowHiddenOpacity)");
  expect(rules).not.toMatch(/#[0-9a-f]{3,8}\b|(?:width|height|font-size)\s*:\s*\d+px|opacity\s*:\s*[\d.]/i);
  const{FLOW_BADGE_GEOMETRY}=await import("./diagramCardModel.js");const{FLOW_BADGE_FONT_SIZE,FLOW_BADGE_LINE_HEIGHT}=await import("@sentropic/diagram-canvas");
  expect(FLOW_BADGE_GEOMETRY).toEqual({size:FLOW_BADGE_FONT_SIZE,lineHeight:FLOW_BADGE_LINE_HEIGHT});
 });
});
