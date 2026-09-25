// @vitest-environment jsdom
// Svelte tab of the store-driven demos: DatavizSvelteNode renders the real
// `@sentropic/dataviz-svelte` adapters over a real DashboardStore (never a
// mock), and states a missing adapter instead of staying empty.
import { cleanup, render, waitFor } from "@testing-library/svelte";
import { afterEach, describe, expect, it } from "vitest";
import { createDashboardStore, type DataModel } from "@sentropic/dataviz-core";

import DatavizSvelteNode from "./DatavizSvelteNode.svelte";
import {
  dashboardGridDemoNodes,
  dataImageDemoNodes,
  scoreCardStoreDemoNodes,
  timeSeriesDemoNodes,
  urlSyncDemoNodes,
  webFrameDemoNodes,
  type NodeSpec
} from "./examples";

afterEach(cleanup);

const model: DataModel = {
  dimensions: [{ id: "product", label: "Product", type: "discrete" }],
  measures: [{ id: "revenue", label: "Revenue", aggregation: "sum" }]
};

const newStore = () =>
  createDashboardStore({
    model,
    data: [
      { product: "Atlas", revenue: 120 },
      { product: "Beacon", revenue: 80 }
    ]
  });

function renderNodes(nodes: NodeSpec[]) {
  const views = nodes.map((node) => render(DatavizSvelteNode, { node }));
  return { host: document.body, views };
}

describe("DatavizSvelteNode", () => {
  it("renders a store-driven ScoreCard from a real store", async () => {
    const { host } = renderNodes(
      scoreCardStoreDemoNodes(newStore(), { viewId: "sc", measure: "revenue", label: "Revenue" })
    );
    await waitFor(() => expect(host.textContent).toContain("Revenue"));
    expect(host.textContent).toContain("200");
  });

  it("renders WebFrame markup", async () => {
    const { host } = renderNodes(
      webFrameDemoNodes({ src: "https://example.com", title: "Example" })
    );
    await waitFor(() => expect(host.querySelector("iframe")).not.toBeNull());
    expect(host.querySelector("iframe")?.getAttribute("src")).toBe("https://example.com");
  });

  it("states a missing Svelte adapter instead of staying empty", async () => {
    const { host } = renderNodes(
      timeSeriesDemoNodes(newStore(), { viewId: "ts", time: "t", measure: "revenue", label: "L" })
    );
    await waitFor(() =>
      expect(host.textContent).toContain("Svelte adapter missing: TimeSeriesLineChart")
    );
  });

  it("renders DataImage markup", async () => {
    const { host } = renderNodes(
      dataImageDemoNodes({ src: "https://example.com/a.png", alt: "A" })
    );
    await waitFor(() => expect(host.querySelector("img")).not.toBeNull());
    expect(host.querySelector("img")?.getAttribute("alt")).toBe("A");
  });

  it("renders DashboardGrid panels with no store channel", async () => {
    const { host } = renderNodes(
      dashboardGridDemoNodes({
        columns: 12,
        panels: [{ id: "pipeline", x: 6, y: 0, w: 6, h: 2 }]
      })
    );
    await waitFor(() =>
      expect(host.querySelector('section[aria-label="pipeline"]')).not.toBeNull()
    );
  });

  it("mounts UrlSync with no markup by design", async () => {
    const { host } = renderNodes(urlSyncDemoNodes(newStore()));
    // The demo wrapper proves the mount ran; the component itself renders
    // nothing (declarative URL wiring only).
    await waitFor(() => expect(host.querySelector(".chart-wrapper")).not.toBeNull());
    expect(host.textContent?.trim()).toBe("");
  });
});
