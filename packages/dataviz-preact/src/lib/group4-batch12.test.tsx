import { signal } from "@preact/signals";
import { cleanup, render, screen, waitFor } from "@testing-library/preact";
import { createDashboardStore, type DataModel, type Row } from "@sentropic/dataviz-core";
import { afterEach, describe, expect, it } from "vitest";
import { WindBarbChart } from "./WindBarbChart.js";
import { WordCloudChart } from "./WordCloudChart.js";

afterEach(cleanup);

describe("P6 group 4 batch 12 (Preact leg + MaybeSignal mutations)", () => {
  it("WindBarbChart and WordCloudChart react to post-mount className signals with normalised SVG", async () => {
    const model: DataModel = {
      dimensions: [{ id: "word", label: "Word", type: "discrete" }],
      measures: [
        { id: "at", label: "At", aggregation: "avg" },
        { id: "speed", label: "Speed", aggregation: "avg" },
        { id: "dir", label: "Direction", aggregation: "avg" },
        { id: "weight", label: "Weight", aggregation: "sum" },
      ],
    };
    const rows: Row[] = [
      { word: "signals", at: 1, speed: 15, dir: 90, weight: 40 },
      { word: "preact", at: 2, speed: 25, dir: 180, weight: 65 },
      { word: "dataviz", at: 3, speed: 10, dir: 270, weight: 30 },
    ];
    const store = createDashboardStore({ model, data: rows });

    const windCls = signal("wind-a");
    const cloudCls = signal("cloud-a");

    const { container } = render(
      <>
        <WindBarbChart store={store} viewId="wb" at="at" speed="speed" direction="dir" label="Wind forecast" className={windCls} />
        <WordCloudChart store={store} viewId="wc" word_field="word" weight="weight" label="Topic cloud" className={cloudCls} />
      </>,
    );

    expect(screen.getByRole("img", { name: "Wind forecast" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Topic cloud" })).toBeTruthy();
    expect(container.querySelector(".wind-a")).toBeTruthy();
    expect(container.querySelector(".cloud-a")).toBeTruthy();
    expect(container.querySelector(".wind-a [strokeWidth]")).toBeNull();
    expect(container.querySelector(".cloud-a [textAnchor]")).toBeNull();

    windCls.value = "wind-b";
    cloudCls.value = "cloud-b";

    await waitFor(() => {
      expect(container.querySelector(".wind-b")).toBeTruthy();
      expect(container.querySelector(".cloud-b")).toBeTruthy();
    });
  });
});
