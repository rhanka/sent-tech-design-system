import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import { tick } from "svelte";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import DiagramSceneFigure from "./DiagramSceneFigure.svelte";
import VueFigure from "../../../components-vue/src/DiagramNumberedScene.vue";
import { flowHostCases } from "../../../diagram-canvas/test-support/flowHostCases.js";
import { runFlowHostCase, flowDomOf, propsFor } from "../../../diagram-canvas/tests/host-support/flowHostContract.js";

const mounted:{unmount:()=>void;container:HTMLElement}[]=[];
beforeEach(()=>{
 vi.stubGlobal("ResizeObserver",class{observe(){}disconnect(){}});
 vi.stubGlobal("matchMedia",()=>({matches:true,addEventListener(){},removeEventListener(){}}));
 Object.defineProperty(HTMLElement.prototype,"clientWidth",{configurable:true,get:()=>1280});
});
afterEach(()=>{cleanup();for(const view of mounted.splice(0)){view.unmount();view.container.remove();}vi.unstubAllGlobals();delete (HTMLElement.prototype as {clientWidth?:number}).clientWidth;});
const mountVue:Parameters<typeof runFlowHostCase>[1]=(props)=>{
 const container=document.createElement("div");document.body.append(container);
 const view=mount(VueFigure,{props,attachTo:container});mounted.push({unmount:()=>view.unmount(),container});
 return {container,rerender:(next)=>view.setProps(next)};
};
describe("DC-2c A12 normalized Svelte/Vue scene DOM",()=>{
 for(const test of flowHostCases)it(test.id,async()=>{
  const svelte=await runFlowHostCase(test,(props)=>render(DiagramSceneFigure,props),tick);
  const expected=flowDomOf(svelte.container);
  cleanup();
  const vue=await runFlowHostCase(test,mountVue,nextTick);
  expect(flowDomOf(vue.container)).toEqual(expected);
 });
 it("keeps the complete no-flow scene equal across hosts",async()=>{
  const props=propsFor(0),svelte=render(DiagramSceneFigure,props);await tick();
  const vue=mountVue(props);await nextTick();expect(flowDomOf(vue.container)).toEqual(flowDomOf(svelte.container));
 });
});
