import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { LineChart, BarChart, AreaChart } from "./index.js";

const lineData = [
  { x: "Jan", y: 2 },
  { x: "Feb", y: 4 },
  { x: "Mar", y: 6 },
];
const barData = [
  { label: "A", value: 5 },
  { label: "B", value: 9 },
  { label: "C", value: 3 },
];

describe("LineChart crosshair / synchronised hover (FR-3)", () => {
  it("uncontrolled (no hoverKey): no crosshair by default, internal hover drives it", async () => {
    const wrapper = mount(LineChart, { props: { data: lineData, label: "Uncontrolled" } });
    expect(wrapper.find(".st-lineChart__crosshair").exists()).toBe(false);
    expect(wrapper.find(".st-lineChart__tooltip").exists()).toBe(false);

    await wrapper.findAll(".st-lineChart__dot")[1].trigger("pointermove");
    expect(wrapper.find(".st-lineChart__crosshair").exists()).toBe(true);
    expect(wrapper.find(".st-lineChart__tooltipLabel").text()).toBe("Feb");

    await wrapper.find(".st-lineChart__visual").trigger("pointerleave");
    expect(wrapper.find(".st-lineChart__crosshair").exists()).toBe(false);
  });

  it("controlled: crosshair + tooltip reflect hoverKey, ignoring internal pointer", async () => {
    const wrapper = mount(LineChart, { props: { data: lineData, label: "Controlled", hoverKey: "Mar" } });
    expect(wrapper.find(".st-lineChart__crosshair").exists()).toBe(true);
    expect(wrapper.find(".st-lineChart__tooltipLabel").text()).toBe("Mar");

    await wrapper.findAll(".st-lineChart__dot")[0].trigger("pointermove");
    expect(wrapper.find(".st-lineChart__tooltipLabel").text()).toBe("Mar");
  });

  it("controlled with hoverKey=null shows nothing", () => {
    const wrapper = mount(LineChart, { props: { data: lineData, label: "Null", hoverKey: null } });
    expect(wrapper.find(".st-lineChart__crosshair").exists()).toBe(false);
    expect(wrapper.find(".st-lineChart__tooltip").exists()).toBe(false);
  });

  it("emits onHoverKeyChange on move (the datum key) and on leave (null)", async () => {
    const onHoverKeyChange = vi.fn();
    const wrapper = mount(LineChart, { props: { data: lineData, label: "Emit", onHoverKeyChange } });
    await wrapper.findAll(".st-lineChart__dot")[2].trigger("pointermove");
    expect(onHoverKeyChange).toHaveBeenLastCalledWith("Mar");
    await wrapper.find(".st-lineChart__visual").trigger("pointerleave");
    expect(onHoverKeyChange).toHaveBeenLastCalledWith(null);
  });

  it("controlled chart STILL emits onHoverKeyChange (shared channel)", async () => {
    const onHoverKeyChange = vi.fn();
    const wrapper = mount(LineChart, {
      props: { data: lineData, label: "ControlledEmit", hoverKey: "Jan", onHoverKeyChange },
    });
    await wrapper.findAll(".st-lineChart__dot")[1].trigger("pointermove");
    expect(onHoverKeyChange).toHaveBeenLastCalledWith("Feb");
  });
});

describe("BarChart crosshair / synchronised hover (FR-3)", () => {
  it("uncontrolled: no crosshair until hover", async () => {
    const wrapper = mount(BarChart, { props: { data: barData, label: "Bars" } });
    expect(wrapper.find(".st-barChart__crosshair").exists()).toBe(false);
    await wrapper.findAll(".st-barChart__bar")[1].trigger("pointermove");
    expect(wrapper.find(".st-barChart__crosshair").exists()).toBe(true);
    expect(wrapper.find(".st-barChart__tooltipLabel").text()).toBe("B");
  });

  it("controlled: crosshair + tooltip track hoverKey (bar label)", () => {
    const wrapper = mount(BarChart, { props: { data: barData, label: "Bars", hoverKey: "C" } });
    expect(wrapper.find(".st-barChart__crosshair").exists()).toBe(true);
    expect(wrapper.find(".st-barChart__tooltipLabel").text()).toBe("C");
  });

  it("emits onHoverKeyChange with the bar label / null", async () => {
    const onHoverKeyChange = vi.fn();
    const wrapper = mount(BarChart, { props: { data: barData, label: "Bars", onHoverKeyChange } });
    await wrapper.findAll(".st-barChart__bar")[0].trigger("pointermove");
    expect(onHoverKeyChange).toHaveBeenLastCalledWith("A");
    await wrapper.find(".st-barChart__visual").trigger("pointerleave");
    expect(onHoverKeyChange).toHaveBeenLastCalledWith(null);
  });

  it("horizontal bars: crosshair is rendered on hover too", () => {
    const wrapper = mount(BarChart, { props: { data: barData, label: "Bars", orientation: "horizontal", hoverKey: "A" } });
    expect(wrapper.find(".st-barChart__crosshairLine").exists()).toBe(true);
  });
});

describe("AreaChart crosshair / synchronised hover (FR-3)", () => {
  const areaData = [
    { x: "Q1", y: 10 },
    { x: "Q2", y: 20 },
    { x: "Q3", y: 15 },
  ];

  it("uncontrolled: no crosshair until hover", async () => {
    const wrapper = mount(AreaChart, { props: { data: areaData, label: "Area" } });
    expect(wrapper.find(".st-areaChart__crosshair").exists()).toBe(false);
    await wrapper.findAll(".st-areaChart__dot")[1].trigger("pointermove");
    expect(wrapper.find(".st-areaChart__crosshair").exists()).toBe(true);
    expect(wrapper.find(".st-areaChart__tooltipLabel").text()).toBe("Q2");
  });

  it("controlled: tracks hoverKey", () => {
    const wrapper = mount(AreaChart, { props: { data: areaData, label: "Area", hoverKey: "Q3" } });
    expect(wrapper.find(".st-areaChart__tooltipLabel").text()).toBe("Q3");
  });

  it("bare-number data uses the index as key", async () => {
    const onHoverKeyChange = vi.fn();
    const wrapper = mount(AreaChart, { props: { data: [5, 7, 9], label: "Area", onHoverKeyChange } });
    await wrapper.findAll(".st-areaChart__dot")[2].trigger("pointermove");
    expect(onHoverKeyChange).toHaveBeenLastCalledWith("2");
  });
});
