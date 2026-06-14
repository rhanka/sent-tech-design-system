import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { TraceWaterfallChart } from "./TraceWaterfallChart.js";

const trace = {
  spans: [
    { spanId: "1", parentSpanId: null, service: "gateway", start: 0, duration: 100 },
    { spanId: "2", parentSpanId: "1", service: "auth", start: 5, duration: 20 },
    { spanId: "3", parentSpanId: "1", service: "orders", start: 30, duration: 60 },
    { spanId: "4", parentSpanId: "3", service: "db", start: 40, duration: 30 },
  ],
};

const listItems = (el: HTMLElement) =>
  Array.from(el.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("TraceWaterfallChart", () => {
  it("renders one bar per span", () => {
    const wrapper = mount(TraceWaterfallChart, { props: { label: "Trace", data: trace } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector('[role="img"]')).toBeTruthy();
    expect(el.querySelectorAll(".st-traceWaterfallChart__bar").length).toBe(trace.spans.length);
  });

  it("orders spans by hierarchy (DFS) and indents the accessible list by depth", () => {
    const wrapper = mount(TraceWaterfallChart, { props: { label: "Trace", data: trace } });
    const items = listItems(wrapper.element as HTMLElement);
    expect(items[0]).toBe("gateway: 0 → 100");
    expect(items[1]).toBe("·auth: 5 → 25");
    expect(items[2]).toBe("·orders: 30 → 90");
    expect(items[3]).toBe("··db: 40 → 70");
  });

  it("colours bars by service (categoryN) and renders a legend", () => {
    const wrapper = mount(TraceWaterfallChart, { props: { label: "Trace", data: trace } });
    const bars = (wrapper.element as HTMLElement).querySelectorAll(".st-traceWaterfallChart__bar");
    expect(bars[0].classList.contains("st-traceWaterfallChart__bar--category1")).toBe(true);
    expect(bars[1].classList.contains("st-traceWaterfallChart__bar--category2")).toBe(true);
    expect((wrapper.element as HTMLElement).querySelectorAll(".st-traceWaterfallChart__legendItem").length).toBe(4);
  });

  it("offsets each bar by its start (x0 = start, width = duration)", () => {
    const wrapper = mount(TraceWaterfallChart, { props: { label: "T", data: trace } });
    const bars = (wrapper.element as HTMLElement).querySelectorAll<SVGRectElement>(
      ".st-traceWaterfallChart__bar",
    );
    const xGateway = Number(bars[0].getAttribute("x"));
    const xOrders = Number(bars[2].getAttribute("x"));
    expect(xOrders).toBeGreaterThan(xGateway);
  });

  it("drops spans missing id/service or with non-finite timing before rendering", () => {
    const wrapper = mount(TraceWaterfallChart, {
      props: {
        label: "Filtré",
        data: {
          spans: [
            { spanId: "", parentSpanId: null, service: "x", start: 0, duration: 5 },
            { spanId: "a", parentSpanId: null, service: "", start: 0, duration: 5 },
            { spanId: "b", parentSpanId: null, service: "y", start: Number.NaN, duration: 5 },
            { spanId: "c", parentSpanId: null, service: "ok", start: 1, duration: 4 },
          ],
        },
      },
    });
    expect((wrapper.element as HTMLElement).querySelectorAll(".st-traceWaterfallChart__bar").length).toBe(1);
  });

  it("treats spans with an unknown parent as roots (nothing dropped)", () => {
    const wrapper = mount(TraceWaterfallChart, {
      props: {
        label: "Orphelin",
        data: {
          spans: [
            { spanId: "1", parentSpanId: "missing", service: "a", start: 0, duration: 10 },
            { spanId: "2", parentSpanId: "1", service: "b", start: 2, duration: 4 },
          ],
        },
      },
    });
    expect((wrapper.element as HTMLElement).querySelectorAll(".st-traceWaterfallChart__bar").length).toBe(2);
  });
});
