import { afterEach,beforeEach,describe,expect,it,vi } from "vitest";
import { fireEvent } from "@testing-library/dom";
import { mount } from "@vue/test-utils";
import { nextTick as tick } from "vue";
import * as model from "@sentropic/diagram-canvas/diagramSceneModel";
import { createLayoutCache,DEFAULT_FLOW_TOKENS } from "@sentropic/diagram-canvas";
import { flowHitSize,type StepChange } from "@sentropic/diagram-canvas/flowModel";
import { runFlowHostCase } from "../../diagram-canvas/dist-host-support/host-support/flowHostContract.js";
import { flowHostCases } from "../../diagram-canvas/dist-test-support/flowHostCases.js";
import { flowFixture,flowMeasure } from "../../diagram-canvas/dist-test-support/flowFixture.js";
import { DiagramSceneFigure, type DiagramSceneFigureProps } from "./DiagramSceneFigure.js";
const mounted:{unmount:()=>void;container:HTMLElement}[]=[];
function render(_component:typeof DiagramSceneFigure,props:DiagramSceneFigureProps){const container=document.createElement("div");document.body.append(container);const view=mount(DiagramSceneFigure,{props,attachTo:container});mounted.push({unmount:()=>view.unmount(),container});return {container,rerender:(next:Partial<DiagramSceneFigureProps>)=>view.setProps(next)};}
function cleanup(){for(const view of mounted.splice(0)){view.unmount();view.container.remove();}}

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
describe("DC-2c A12 shared host cases — Vue",()=>{
 it("waits for a controlled navigation proposal before announcing or pressing its badge",async()=>{
  const props=propsFor(),step=vi.fn(),view=render(DiagramSceneFigure,{...props,activeStep:null,onStepChange:step});await tick();
  const readout=()=>view.container.querySelector('.st-diagramSceneFigure-flowNavigator output[aria-label="Step"]')?.textContent;
  const live=()=>view.container.querySelector('output.st-diagramSceneFigure-flowDescription')?.textContent;
  await fireEvent.click([...view.container.querySelectorAll("button")].find((b)=>b.textContent==="Next step")!);await tick();
  expect(step.mock.calls).toEqual([[{relation:"relation:z",scenario:"",ordinal:0,visible:{kind:"edge",occurrence:"occurrence:r.z"}}]]);
  expect(readout()).toBe("");expect(view.container.querySelector('[aria-pressed="true"]')).toBeNull();expect(live()).toBe("");
  await view.rerender({activeStep:"relation:z"});await tick();
  expect(readout()).toBe("Step 1");expect(view.container.querySelector('[data-flow-badge="occurrence:r.z"]')?.getAttribute("aria-pressed")).toBe("true");expect(live()).toBe("Step 1");expect(step).toHaveBeenCalledTimes(1);
 });
 for(const test of flowHostCases)it(test.id+": "+test.note,async()=>{
  await runFlowHostCase(test,(props)=>render(DiagramSceneFigure,props),tick);
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

describe("DC-2c Vue source discipline",()=>{it("keeps flow styles token-based and free of motion",async()=>{const{readFileSync}=await import("node:fs");const{fileURLToPath}=await import("node:url");const source=readFileSync(fileURLToPath(import.meta.url).replace(/[^/]+$/,"styles.css"),"utf8");const rules=source.slice(source.indexOf("  .st-diagramSceneFigure-flowNavigator"),source.indexOf("  .st-diagramSceneFigure {"));expect(rules).not.toMatch(/visibility\s*:\s*hidden|display\s*:\s*none|transition\s*:|animation\s*:|#[0-9a-f]{3,8}\b|(?:width|height|font-size)\s*:\s*\d+px|opacity\s*:\s*[\d.]/i);expect(rules).toContain("flowHiddenOpacity");});});
