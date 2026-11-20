import { signal } from "@preact/signals";
import { cleanup, render, screen, waitFor } from "@testing-library/preact";
import { createDashboardStore, type DataModel, type Row } from "@sentropic/dataviz-core";
import { afterEach, describe, expect, it } from "vitest";
import { VectorFieldChart } from "./VectorFieldChart.js";
import { VennChart } from "./VennChart.js";
import { ViolinChart } from "./ViolinChart.js";
import { WaffleChart } from "./WaffleChart.js";
import { WaterfallChart } from "./WaterfallChart.js";

afterEach(cleanup);

describe("P6 group 4 batch 11 (Preact leg + MaybeSignal mutations)", () => {
  it("VectorFieldChart, VennChart, ViolinChart, WaffleChart and WaterfallChart react to post-mount MaybeSignal mutations", async () => {
    const model: DataModel = {
      dimensions: [{ id: "group", label: "Group", type: "discrete" }],
      measures: [
        { id: "x", label: "X", aggregation: "avg" },
        { id: "y", label: "Y", aggregation: "avg" },
        { id: "len", label: "Len", aggregation: "avg" },
        { id: "dir", label: "Dir", aggregation: "avg" },
        { id: "val", label: "Val", aggregation: "sum" },
        { id: "delta", label: "Delta", aggregation: "sum" },
      ],
    };
    const rows: Row[] = [
      { group: "A", x: 1, y: 1, len: 5, dir: 45, val: 10, delta: 20 },
      { group: "A", x: 2, y: 1, len: 6, dir: 90, val: 20, delta: 10 },
      { group: "A", x: 3, y: 1, len: 7, dir: 135, val: 30, delta: 5 },
      { group: "B", x: 1, y: 2, len: 4, dir: 180, val: 15, delta: -12 },
      { group: "B", x: 2, y: 2, len: 8, dir: 270, val: 25, delta: -3 },
    ];
    const store = createDashboardStore({ model, data: rows });

    const vecCls = signal("vec-a");
    const vennCls = signal("venn-a");
    const violinCls = signal("violin-a");
    const quartiles = signal(true);
    const waffleCls = signal("waffle-a");
    const wfCls = signal("wf-a");
    const connectors = signal(true);

    const { container } = render(
      <>
        <VectorFieldChart store={store} viewId="vf" x="x" y="y" length="len" direction="dir" label="Wind vectors" className={vecCls} />
        <VennChart
          areas={[
            { sets: ["A"], value: 10 },
            { sets: ["B"], value: 8 },
            { sets: ["A", "B"], value: 3 },
          ]}
          label="Set overlap"
          className={vennCls}
        />
        <ViolinChart store={store} viewId="vi" groupBy="group" measure="val" quartiles={quartiles} label="Group violin" className={violinCls} />
        <WaffleChart store={store} viewId="wa" label_field="group" value="val" label="Group waffle" className={waffleCls} />
        <WaterfallChart store={store} viewId="wf" category="group" measure="delta" connectors={connectors} label="Delta waterfall" className={wfCls} />
      </>,
    );

    expect(screen.getByRole("img", { name: "Wind vectors" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Set overlap" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Group violin" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Group waffle" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Delta waterfall" })).toBeTruthy();

    expect(container.querySelector(".vec-a")).toBeTruthy();
    expect(container.querySelector(".venn-a")).toBeTruthy();
    expect(container.querySelector(".violin-a")).toBeTruthy();
    expect(container.querySelector(".violin-a .st-violinChart__median")).toBeTruthy();
    expect(container.querySelector(".waffle-a")).toBeTruthy();
    expect(container.querySelector(".wf-a")).toBeTruthy();
    expect(container.querySelector(".wf-a .st-waterfallChart__connector")).toBeTruthy();
    expect(container.querySelector(".wf-a [strokeWidth]")).toBeNull();

    vecCls.value = "vec-b";
    vennCls.value = "venn-b";
    violinCls.value = "violin-b";
    quartiles.value = false;
    waffleCls.value = "waffle-b";
    wfCls.value = "wf-b";
    connectors.value = false;

    await waitFor(() => {
      expect(container.querySelector(".vec-b")).toBeTruthy();
      expect(container.querySelector(".venn-b")).toBeTruthy();
      expect(container.querySelector(".violin-b")).toBeTruthy();
      expect(container.querySelector(".violin-b .st-violinChart__median")).toBeNull();
      expect(container.querySelector(".waffle-b")).toBeTruthy();
      expect(container.querySelector(".wf-b")).toBeTruthy();
      expect(container.querySelector(".wf-b .st-waterfallChart__connector")).toBeNull();
    });
  });
});
