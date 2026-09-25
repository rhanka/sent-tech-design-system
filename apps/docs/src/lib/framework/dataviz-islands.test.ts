// Store-driven dataviz demos across the four TabbedExample islands
// (GD-DATAVIZ-DOCS lot 1). Every demo mounts through the SAME island entry
// points the site uses, over a REAL DashboardStore built with
// createDashboardStore — never a mock. Absent adapters must render the
// explicit unavailable block, never an empty island or a throw.
import { JSDOM } from "jsdom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createDashboardStore, type DataModel } from "@sentropic/dataviz-core";

import {
  dashboardGridDemoNodes,
  dataImageDemoNodes,
  scoreCardStoreDemoNodes,
  storeChartDemoNodes,
  timeSeriesDemoNodes,
  urlSyncDemoNodes,
  usesDataviz,
  webFrameDemoNodes
} from "./examples";
import { mountReactIsland } from "./react-island";
import { mountVueIsland } from "./vue-island";
import { mountAngularIsland } from "./angular-island";

function host() {
  const dom = new JSDOM("<!doctype html><div id=\"host\"></div>");
  const el = dom.window.document.getElementById("host") as HTMLElement;
  vi.stubGlobal("window", dom.window);
  vi.stubGlobal("document", dom.window.document);
  vi.stubGlobal("HTMLElement", dom.window.HTMLElement);
  vi.stubGlobal("SVGElement", dom.window.SVGElement);
  vi.stubGlobal("Element", dom.window.Element);
  vi.stubGlobal("Node", dom.window.Node);
  vi.stubGlobal("navigator", dom.window.navigator);
  return el;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

const model: DataModel = {
  dimensions: [
    { id: "month", label: "Month", type: "discrete" },
    { id: "product", label: "Product", type: "discrete" },
    { id: "t", label: "Day", type: "continuous" }
  ],
  measures: [{ id: "revenue", label: "Revenue", aggregation: "sum" }]
};

const rows = [
  { month: "Jan", product: "Atlas", t: 1, revenue: 120 },
  { month: "Feb", product: "Beacon", t: 2, revenue: 80 }
];

const newStore = () => createDashboardStore({ model, data: rows });

describe("dataviz demo builders", () => {
  it("tag every node library:dataviz", () => {
    const store = newStore();
    const all = [
      ...urlSyncDemoNodes(store),
      ...webFrameDemoNodes({ src: "https://example.com" }),
      ...timeSeriesDemoNodes(store, { viewId: "ts", time: "t", measure: "revenue", label: "L" }),
      ...scoreCardStoreDemoNodes(store, { measure: "revenue" }),
      ...dataImageDemoNodes({ src: "https://example.com/a.png" }, rows[0]),
      ...dashboardGridDemoNodes({ columns: 12, panels: [] })
    ];
    expect(usesDataviz(all)).toBe(true);
    expect(usesDataviz([{ comp: "Button", props: {}, children: ["x"] }])).toBe(false);
  });
});

describe("react island (dataviz)", () => {
  // createRoot() commits asynchronously: poll for the commit instead of
  // asserting the synchronous post-mount DOM (empty by design, not a bug —
  // the site path is identical and paints on the next frame).
  it("renders ScoreCard from a real store", async () => {
    const el = host();
    const handle = await mountReactIsland(
      el,
      scoreCardStoreDemoNodes(newStore(), { viewId: "sc", measure: "revenue", label: "Revenue" })
    );
    await vi.waitFor(() => expect(el.textContent).toContain("Revenue"));
    expect(el.textContent).toContain("200");
    handle.unmount();
    expect(el.textContent).toBe("");
  });

  it("renders the react-only TimeSeriesLineChart", async () => {
    const el = host();
    const handle = await mountReactIsland(
      el,
      timeSeriesDemoNodes(newStore(), { viewId: "ts", time: "t", measure: "revenue", label: "Daily" })
    );
    await vi.waitFor(() => expect(el.querySelector("svg")).not.toBeNull());
    handle.unmount();
  });

  it("renders WebFrame and DataImage markup", async () => {
    const el = host();
    const handle = await mountReactIsland(el, [
      ...webFrameDemoNodes({ src: "https://example.com", title: "Example" }),
      ...dataImageDemoNodes({ src: "https://example.com/a.png", alt: "A" })
    ]);
    await vi.waitFor(() =>
      expect(el.querySelector("iframe")?.getAttribute("src")).toBe("https://example.com")
    );
    expect(el.querySelector("img")?.getAttribute("alt")).toBe("A");
    handle.unmount();
  });

  it("states the missing UrlSync component instead of staying empty", async () => {
    const el = host();
    const handle = await mountReactIsland(el, urlSyncDemoNodes(newStore()));
    await vi.waitFor(() => expect(el.textContent).toContain("React adapter missing: UrlSync"));
    handle.unmount();
  });
});

describe("vue island (dataviz)", () => {
  it("renders ScoreCard from a real store", async () => {
    const el = host();
    const handle = await mountVueIsland(
      el,
      scoreCardStoreDemoNodes(newStore(), { viewId: "sc", measure: "revenue", label: "Revenue" })
    );
    expect(el.textContent).toContain("Revenue");
    expect(el.textContent).toContain("200");
    handle.unmount();
  });

  it("renders WebFrame markup", async () => {
    const el = host();
    const handle = await mountVueIsland(
      el,
      webFrameDemoNodes({ src: "https://example.com", title: "Example" })
    );
    expect(el.querySelector("iframe")?.getAttribute("src")).toBe("https://example.com");
    handle.unmount();
  });

  it("states the missing TimeSeriesLineChart instead of staying empty", async () => {
    const el = host();
    const handle = await mountVueIsland(
      el,
      timeSeriesDemoNodes(newStore(), { viewId: "ts", time: "t", measure: "revenue", label: "Daily" })
    );
    expect(el.textContent).toContain("Vue adapter missing: TimeSeriesLineChart");
    handle.unmount();
  });
});

describe("angular island (dataviz)", () => {
  it("renders a ported store-driven chart from a real store", async () => {
    const el = host();
    const handle = await mountAngularIsland(
      el,
      storeChartDemoNodes("AreaChart", {
        store: newStore(),
        viewId: "ac",
        category: "month",
        measure: "revenue",
        label: "Revenue"
      })
    );
    expect(el.querySelector("svg")).not.toBeNull();
    handle.unmount();
  });

  it("states the missing ScoreCard adapter instead of staying empty", async () => {
    const el = host();
    const handle = await mountAngularIsland(
      el,
      scoreCardStoreDemoNodes(newStore(), { measure: "revenue" })
    );
    expect(el.textContent).toContain("Angular component missing: ScoreCard");
    handle.unmount();
  });
});
