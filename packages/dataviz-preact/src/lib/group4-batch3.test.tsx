import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { createDashboardStore, type DashboardObjectLayer, type DataModel, type Row } from "@sentropic/dataviz-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MekkoChart } from "./MekkoChart.js";
import { OHLCChart } from "./OHLCChart.js";
import { DataImage, ObjectLayerPanel, WebFrame } from "./ObjectLayers.js";
import { OrganizationChart } from "./OrganizationChart.js";
import { PackedBubbleChart } from "./PackedBubbleChart.js";

afterEach(cleanup);

describe("P6 group 4 batch 3 (Preact leg + MaybeSignal mutations)", () => {
  it("MekkoChart, OHLCChart, OrganizationChart and PackedBubbleChart react to post-mount className signals with normalised SVG", async () => {
    const model: DataModel = {
      dimensions: [
        { id: "region", label: "Region", type: "discrete" },
        { id: "seg", label: "Segment", type: "discrete" },
        { id: "id", label: "Id", type: "discrete" },
        { id: "parent", label: "Parent", type: "discrete" },
        { id: "name", label: "Name", type: "discrete" },
      ],
      measures: [
        { id: "open", label: "Open", aggregation: "avg" },
        { id: "high", label: "High", aggregation: "max" },
        { id: "low", label: "Low", aggregation: "min" },
        { id: "close", label: "Close", aggregation: "avg" },
        { id: "rev", label: "Revenue", aggregation: "sum" },
      ],
    };
    const rows: Row[] = [
      { region: "North", seg: "Ent", id: "ceo", parent: "", name: "CEO", open: 100, high: 120, low: 95, close: 115, rev: 60 },
      { region: "South", seg: "SMB", id: "cto", parent: "ceo", name: "CTO", open: 115, high: 130, low: 105, close: 125, rev: 40 },
    ];
    const store = createDashboardStore({ model, data: rows });

    const mekkoCls = signal("mekko-a");
    const ohlcCls = signal("ohlc-a");
    const orgCls = signal("org-a");
    const bubbleCls = signal("bubble-a");

    const { container } = render(
      <>
        <MekkoChart store={store} viewId="mk" category="region" series="seg" measure="rev" label="Revenue mekko" className={mekkoCls} />
        <OHLCChart store={store} viewId="ohlc" label_field="region" open="open" high="high" low="low" close="close" label="Market OHLC" className={ohlcCls} />
        <OrganizationChart store={store} viewId="org" id_field="id" parent_field="parent" label_field="name" label="Org tree" className={orgCls} />
        <PackedBubbleChart store={store} viewId="pb" category="region" measure="rev" label="Bubble share" className={bubbleCls} />
      </>,
    );

    expect(screen.getByRole("img", { name: "Revenue mekko" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Market OHLC" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Org tree" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Bubble share" })).toBeTruthy();

    expect(container.querySelector(".mekko-a")).toBeTruthy();
    expect(container.querySelector(".ohlc-a")).toBeTruthy();
    expect(container.querySelector(".org-a")).toBeTruthy();
    expect(container.querySelector(".bubble-a")).toBeTruthy();
    expect(container.querySelector(".ohlc-a [strokeWidth]")).toBeNull();

    mekkoCls.value = "mekko-b";
    ohlcCls.value = "ohlc-b";
    orgCls.value = "org-b";
    bubbleCls.value = "bubble-b";

    await waitFor(() => {
      expect(container.querySelector(".mekko-b")).toBeTruthy();
      expect(container.querySelector(".ohlc-b")).toBeTruthy();
      expect(container.querySelector(".org-b")).toBeTruthy();
      expect(container.querySelector(".bubble-b")).toBeTruthy();
    });
  });

  it("WebFrame, DataImage and ObjectLayerPanel react to post-mount MaybeSignal mutations and preserve handlers", async () => {
    const layers: DashboardObjectLayer[] = [
      { id: "page", label: "Page", kind: "group" },
      { id: "web", label: "Help page", kind: "iframe", parentId: "page" },
      { id: "logo", label: "Customer logo", kind: "image", parentId: "page", visible: false },
    ];
    const frameCls = signal("frame-a");
    const imgCls = signal("img-a");
    const panelCls = signal("panel-a");
    const selectedId = signal("logo");
    const expandedIds = signal<string[]>(["page"]);
    const onImgClick = vi.fn();
    const onSelect = vi.fn();
    const onVisibilityChange = vi.fn();

    const { container } = render(
      <>
        <WebFrame frame={{ src: "https://example.com/embed", title: "Embed" }} className={frameCls} />
        <DataImage
          image={{ srcTemplate: "https://cdn.example.com/{{slug}}.png", altTemplate: "Logo {{customer}}" }}
          row={{ slug: "acme", customer: "Acme" }}
          className={imgCls}
          onClick={onImgClick}
        />
        <ObjectLayerPanel
          layers={layers}
          selectedId={selectedId}
          expandedIds={expandedIds}
          onSelect={onSelect}
          onVisibilityChange={onVisibilityChange}
          className={panelCls}
        />
      </>,
    );

    const iframe = screen.getByTitle("Embed");
    const img = screen.getByAltText("Logo Acme");
    const group = screen.getByRole("group", { name: "Objects" });
    expect(iframe.className).toBe("frame-a");
    expect(img.className).toBe("img-a");
    expect(group.className).toBe("panel-a");
    expect(screen.getByRole("button", { name: "Select Customer logo" }).className).toContain("primary");
    expect(screen.getByText("Help page")).toBeTruthy();

    fireEvent.click(img);
    expect(onImgClick).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Select Help page" }));
    expect(onSelect).toHaveBeenCalledWith(layers[1]);
    fireEvent.click(screen.getByRole("button", { name: "Show Customer logo" }));
    expect(onVisibilityChange).toHaveBeenCalledWith(layers[2], true);

    frameCls.value = "frame-b";
    imgCls.value = "img-b";
    panelCls.value = "panel-b";
    selectedId.value = "web";
    expandedIds.value = [];

    await waitFor(() => {
      expect(iframe.className).toBe("frame-b");
      expect(img.className).toBe("img-b");
      expect(group.className).toBe("panel-b");
      expect(screen.getByRole("button", { name: "Select Help page" }).className).toContain("primary");
      expect(container.querySelector('[role="treeitem"][aria-expanded="true"]')).toBeNull();
    });
  });
});
