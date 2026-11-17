import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TileMapChart } from "./TileMapChart.js";
import { TimelineChart } from "./TimelineChart.js";
import { TraceWaterfallChart } from "./TraceWaterfallChart.js";
import { TreegraphChart } from "./TreegraphChart.js";
import { TreemapChart } from "./TreemapChart.js";
import { UnorderedList } from "./UnorderedList.js";
import { VariablePieChart } from "./VariablePieChart.js";
import { VectorFieldChart } from "./VectorFieldChart.js";
import { VennChart } from "./VennChart.js";
import { ViolinChart } from "./ViolinChart.js";
import { WaffleChart } from "./WaffleChart.js";
import { WaterfallChart } from "./WaterfallChart.js";
import { WindBarbChart } from "./WindBarbChart.js";
import { WordCloudChart } from "./WordCloudChart.js";

afterEach(cleanup);

describe("P4b group 3 edges (data: signals at the edges, post-mount mutation)", () => {
  it("accepts a Signal for className on every group-3 module", () => {
    const { container } = render(
      <>
        <TileMapChart data-testid="e-tilemap" data={[{ label: "A", col: 0, row: 0, value: 2 }]} label="L" className={signal("x-tilemap")} />
        <TimelineChart data-testid="e-timeline" data={[{ position: 2020, label: "E" }]} label="L" className={signal("x-timeline")} />
        <TraceWaterfallChart
          data-testid="e-trace"
          data={{ spans: [{ spanId: "1", service: "s", start: 0, duration: 5 }] }}
          label="L"
          className={signal("x-trace")}
        />
        <TreegraphChart
          data-testid="e-treegraph"
          data={[
            { id: "r", label: "R" },
            { id: "a", parentId: "r", label: "A" },
          ]}
          label="L"
          className={signal("x-treegraph")}
        />
        <TreemapChart data-testid="e-treemap" data={[{ label: "A", value: 2 }]} label="L" className={signal("x-treemap")} />
        <UnorderedList data-testid="e-list" items={["a", "b"]} className={signal("x-list")} />
        <VariablePieChart data-testid="e-varpie" data={[{ label: "A", value: 1, z: 2 }]} label="L" className={signal("x-varpie")} />
        <VectorFieldChart data-testid="e-vector" data={[{ x: 0, y: 0, length: 1, direction: 0 }]} label="L" className={signal("x-vector")} />
        <VennChart data-testid="e-venn" data={[{ sets: ["A"], value: 3 }]} label="L" className={signal("x-venn")} />
        <ViolinChart data-testid="e-violin" data={[{ label: "A", values: [1, 2, 3] }]} label="L" className={signal("x-violin")} />
        <WaffleChart data-testid="e-waffle" data={[{ label: "A", value: 60 }]} label="L" className={signal("x-waffle")} />
        <WaterfallChart data-testid="e-waterfall" data={[{ label: "A", value: 10 }]} label="L" className={signal("x-waterfall")} />
        <WindBarbChart data-testid="e-wind" data={[{ at: 0, speed: 10, direction: 0 }]} label="L" className={signal("x-wind")} />
        <WordCloudChart data-testid="e-word" data={[{ text: "hi", weight: 5 }]} label="L" className={signal("x-word")} />
      </>,
    );
    for (const [testId, extra] of [
      ["e-tilemap", "x-tilemap"],
      ["e-timeline", "x-timeline"],
      ["e-trace", "x-trace"],
      ["e-treegraph", "x-treegraph"],
      ["e-treemap", "x-treemap"],
      ["e-list", "x-list"],
      ["e-varpie", "x-varpie"],
      ["e-vector", "x-vector"],
      ["e-venn", "x-venn"],
      ["e-violin", "x-violin"],
      ["e-waffle", "x-waffle"],
      ["e-waterfall", "x-waterfall"],
      ["e-wind", "x-wind"],
      ["e-word", "x-word"],
    ] as const) {
      expect(screen.getByTestId(testId).className).toContain(extra);
    }
    expect(container.querySelector(".st-unorderedList")).not.toBeNull();
  });

  it("follows className signals mutated after mount on every group-3 module", async () => {
    const tilemap = signal("x-tilemap");
    const timeline = signal("x-timeline");
    const trace = signal("x-trace");
    const treegraph = signal("x-treegraph");
    const treemap = signal("x-treemap");
    const list = signal("x-list");
    const varpie = signal("x-varpie");
    const vector = signal("x-vector");
    const venn = signal("x-venn");
    const violin = signal("x-violin");
    const waffle = signal("x-waffle");
    const waterfall = signal("x-waterfall");
    const wind = signal("x-wind");
    const word = signal("x-word");
    render(
      <>
        <TileMapChart data-testid="m-tilemap" data={[{ label: "A", col: 0, row: 0, value: 2 }]} label="L" className={tilemap} />
        <TimelineChart data-testid="m-timeline" data={[{ position: 2020, label: "E" }]} label="L" className={timeline} />
        <TraceWaterfallChart
          data-testid="m-trace"
          data={{ spans: [{ spanId: "1", service: "s", start: 0, duration: 5 }] }}
          label="L"
          className={trace}
        />
        <TreegraphChart
          data-testid="m-treegraph"
          data={[
            { id: "r", label: "R" },
            { id: "a", parentId: "r", label: "A" },
          ]}
          label="L"
          className={treegraph}
        />
        <TreemapChart data-testid="m-treemap" data={[{ label: "A", value: 2 }]} label="L" className={treemap} />
        <UnorderedList data-testid="m-list" items={["a", "b"]} className={list} />
        <VariablePieChart data-testid="m-varpie" data={[{ label: "A", value: 1, z: 2 }]} label="L" className={varpie} />
        <VectorFieldChart data-testid="m-vector" data={[{ x: 0, y: 0, length: 1, direction: 0 }]} label="L" className={vector} />
        <VennChart data-testid="m-venn" data={[{ sets: ["A"], value: 3 }]} label="L" className={venn} />
        <ViolinChart data-testid="m-violin" data={[{ label: "A", values: [1, 2, 3] }]} label="L" className={violin} />
        <WaffleChart data-testid="m-waffle" data={[{ label: "A", value: 60 }]} label="L" className={waffle} />
        <WaterfallChart data-testid="m-waterfall" data={[{ label: "A", value: 10 }]} label="L" className={waterfall} />
        <WindBarbChart data-testid="m-wind" data={[{ at: 0, speed: 10, direction: 0 }]} label="L" className={wind} />
        <WordCloudChart data-testid="m-word" data={[{ text: "hi", weight: 5 }]} label="L" className={word} />
      </>,
    );
    const cases = [
      ["m-tilemap", tilemap],
      ["m-timeline", timeline],
      ["m-trace", trace],
      ["m-treegraph", treegraph],
      ["m-treemap", treemap],
      ["m-list", list],
      ["m-varpie", varpie],
      ["m-vector", vector],
      ["m-venn", venn],
      ["m-violin", violin],
      ["m-waffle", waffle],
      ["m-waterfall", waterfall],
      ["m-wind", wind],
      ["m-word", word],
    ] as const;
    for (const [testId, sig] of cases) {
      expect(screen.getByTestId(testId).className).toContain(sig.value);
    }
    for (const [, sig] of cases) {
      sig.value = "x-after";
    }
    for (const [testId] of cases) {
      await waitFor(() => expect(screen.getByTestId(testId).className).toContain("x-after"));
    }
  });

  it("TreemapChart follows showLabels and legend signals mutated after mount", async () => {
    const showLabels = signal(true);
    const legend = signal(false);
    const { container } = render(
      <TreemapChart
        data={[{ label: "A", value: 2 }]}
        label="L"
        width={400}
        height={300}
        showLabels={showLabels}
        legend={legend}
      />,
    );
    // Labels render in large-enough cells; no legend yet.
    expect(container.querySelector(".st-treemapChart__label")).not.toBeNull();
    expect(container.querySelector(".st-treemapChart__legend")).toBeNull();
    showLabels.value = false;
    await waitFor(() => expect(container.querySelector(".st-treemapChart__label")).toBeNull());
    legend.value = true;
    await waitFor(() => expect(container.querySelector(".st-treemapChart__legend")).not.toBeNull());
  });

  it("ViolinChart follows a quartiles signal mutated after mount", async () => {
    const quartiles = signal(true);
    const { container } = render(
      <ViolinChart label="L" data={[{ label: "A", values: [1, 2, 3, 4] }]} quartiles={quartiles} />,
    );
    expect(container.querySelectorAll(".st-violinChart__box")).toHaveLength(1);
    expect(container.querySelectorAll(".st-violinChart__median")).toHaveLength(1);
    quartiles.value = false;
    await waitFor(() => expect(container.querySelectorAll(".st-violinChart__box")).toHaveLength(0));
    expect(container.querySelectorAll(".st-violinChart__median")).toHaveLength(0);
    // The shape itself is untouched by the overlay toggle.
    expect(container.querySelectorAll(".st-violinChart__shape")).toHaveLength(1);
  });

  it("WaterfallChart follows a connectors signal mutated after mount", async () => {
    const connectors = signal(true);
    const { container } = render(
      <WaterfallChart
        label="L"
        data={[
          { label: "A", value: 10 },
          { label: "B", value: 5 },
        ]}
        connectors={connectors}
      />,
    );
    expect(container.querySelectorAll(".st-waterfallChart__connector")).toHaveLength(1);
    connectors.value = false;
    await waitFor(() => expect(container.querySelectorAll(".st-waterfallChart__connector")).toHaveLength(0));
  });

  it("UnorderedList follows a nested signal mutated after mount", async () => {
    const nested = signal(false);
    const { container } = render(<UnorderedList items={["a", "b"]} nested={nested} />);
    expect(container.querySelector("ul")?.className).not.toContain("st-unorderedList--nested");
    nested.value = true;
    await waitFor(() =>
      expect(container.querySelector("ul")?.className).toContain("st-unorderedList--nested"),
    );
  });

  it("TileMapChart keeps a consumer onClick on the host while tooltips track hover", () => {
    const onClick = vi.fn();
    const { container } = render(
      <TileMapChart data={[{ label: "A", col: 0, row: 0, value: 2 }]} label="L" onClick={onClick} />,
    );
    const host = container.querySelector(".st-tileMapChart")!;
    fireEvent.click(host);
    expect(onClick).toHaveBeenCalledTimes(1);
    const tile = container.querySelector("[data-chart-index]");
    expect(tile).not.toBeNull();
    fireEvent.pointerMove(tile!);
    expect(container.querySelector(".st-tileMapChart__tooltip")).not.toBeNull();
  });

  it("TimelineChart keeps a consumer onClick on the host while tooltips track hover", () => {
    const onClick = vi.fn();
    const { container } = render(
      <TimelineChart data={[{ position: 2020, label: "E" }]} label="L" onClick={onClick} />,
    );
    fireEvent.click(container.querySelector(".st-timelineChart")!);
    expect(onClick).toHaveBeenCalledTimes(1);
    const marker = container.querySelector("[data-chart-index]");
    expect(marker).not.toBeNull();
    fireEvent.pointerMove(marker!);
    expect(container.querySelector(".st-timelineChart__tooltip")).not.toBeNull();
  });

  it("TraceWaterfallChart keeps a consumer onClick on the host while tooltips track hover", () => {
    const onClick = vi.fn();
    const { container } = render(
      <TraceWaterfallChart
        data={{ spans: [{ spanId: "1", service: "s", start: 0, duration: 5 }] }}
        label="L"
        onClick={onClick}
      />,
    );
    fireEvent.click(container.querySelector(".st-traceWaterfallChart")!);
    expect(onClick).toHaveBeenCalledTimes(1);
    fireEvent.pointerMove(container.querySelector("[data-chart-index]")!);
    expect(container.querySelector(".st-traceWaterfallChart__tooltip")).not.toBeNull();
  });

  it("TreegraphChart forwards a consumer onClick on the host", () => {
    const onClick = vi.fn();
    const { container } = render(
      <TreegraphChart data={[{ id: "r", label: "R" }]} label="L" onClick={onClick} />,
    );
    fireEvent.click(container.querySelector(".st-treegraphChart")!);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("TreemapChart keeps a consumer onClick on the host while tooltips track hover", () => {
    const onClick = vi.fn();
    const { container } = render(
      <TreemapChart data={[{ label: "A", value: 2 }]} label="L" width={400} height={300} onClick={onClick} />,
    );
    fireEvent.click(container.querySelector(".st-treemapChart")!);
    expect(onClick).toHaveBeenCalledTimes(1);
    fireEvent.pointerMove(container.querySelector("[data-chart-index]")!);
    expect(container.querySelector(".st-treemapChart__tooltip")).not.toBeNull();
  });

  it("UnorderedList forwards a consumer onClick on the host", () => {
    const onClick = vi.fn();
    const { container } = render(<UnorderedList items={["a", "b"]} onClick={onClick} />);
    fireEvent.click(container.querySelector(".st-unorderedList")!);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(container.querySelectorAll(".st-unorderedList__item")).toHaveLength(2);
  });

  it("VariablePieChart keeps a consumer onClick on the host while tooltips track hover", () => {
    const onClick = vi.fn();
    const { container } = render(
      <VariablePieChart data={[{ label: "A", value: 1, z: 2 }]} label="L" onClick={onClick} />,
    );
    fireEvent.click(container.querySelector(".st-variablePieChart")!);
    expect(onClick).toHaveBeenCalledTimes(1);
    fireEvent.pointerMove(container.querySelector("[data-chart-index]")!);
    expect(container.querySelector(".st-variablePieChart__tooltip")).not.toBeNull();
  });

  it("VectorFieldChart keeps a consumer onClick on the host while tooltips track hover", () => {
    const onClick = vi.fn();
    const { container } = render(
      <VectorFieldChart data={[{ x: 0, y: 0, length: 1, direction: 0 }]} label="L" onClick={onClick} />,
    );
    fireEvent.click(container.querySelector(".st-vectorFieldChart")!);
    expect(onClick).toHaveBeenCalledTimes(1);
    fireEvent.pointerMove(container.querySelector("[data-chart-key]")!);
    expect(container.querySelector(".st-vectorFieldChart__tooltip")).not.toBeNull();
  });

  it("VennChart keeps a consumer onClick on the host while tooltips track hover", () => {
    const onClick = vi.fn();
    const { container } = render(<VennChart data={[{ sets: ["A"], value: 3 }]} label="L" onClick={onClick} />);
    fireEvent.click(container.querySelector(".st-vennChart")!);
    expect(onClick).toHaveBeenCalledTimes(1);
    fireEvent.pointerMove(container.querySelector("[data-chart-index]")!);
    expect(container.querySelector(".st-vennChart__tooltip")).not.toBeNull();
  });

  it("ViolinChart keeps a consumer onClick on the host while tooltips track hover", () => {
    const onClick = vi.fn();
    const { container } = render(
      <ViolinChart data={[{ label: "A", values: [1, 2, 3] }]} label="L" onClick={onClick} />,
    );
    fireEvent.click(container.querySelector(".st-violinChart")!);
    expect(onClick).toHaveBeenCalledTimes(1);
    fireEvent.pointerMove(container.querySelector("[data-chart-index]")!);
    expect(container.querySelector(".st-violinChart__tooltip")).not.toBeNull();
  });

  it("WaffleChart forwards a consumer onClick on the host", () => {
    const onClick = vi.fn();
    const { container } = render(<WaffleChart data={[{ label: "A", value: 60 }]} label="L" onClick={onClick} />);
    fireEvent.click(container.querySelector(".st-waffleChart")!);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(container.querySelectorAll(".st-waffleChart__cell")).toHaveLength(100);
  });

  it("WaterfallChart keeps a consumer onClick on the host while tooltips track hover", () => {
    const onClick = vi.fn();
    const { container } = render(
      <WaterfallChart data={[{ label: "A", value: 10 }]} label="L" onClick={onClick} />,
    );
    fireEvent.click(container.querySelector(".st-waterfallChart")!);
    expect(onClick).toHaveBeenCalledTimes(1);
    fireEvent.pointerMove(container.querySelector("[data-chart-index]")!);
    expect(container.querySelector(".st-waterfallChart__tooltip")).not.toBeNull();
  });

  it("WindBarbChart keeps a consumer onClick on the host while tooltips track hover", () => {
    const onClick = vi.fn();
    const { container } = render(
      <WindBarbChart data={[{ at: 0, speed: 10, direction: 0 }]} label="L" onClick={onClick} />,
    );
    fireEvent.click(container.querySelector(".st-windBarbChart")!);
    expect(onClick).toHaveBeenCalledTimes(1);
    fireEvent.pointerMove(container.querySelector("[data-chart-key]")!);
    expect(container.querySelector(".st-windBarbChart__tooltip")).not.toBeNull();
  });

  it("WordCloudChart keeps a consumer onClick on the host while tooltips track hover", () => {
    const onClick = vi.fn();
    const { container } = render(
      <WordCloudChart data={[{ text: "hi", weight: 5 }]} label="L" onClick={onClick} />,
    );
    fireEvent.click(container.querySelector(".st-wordCloudChart")!);
    expect(onClick).toHaveBeenCalledTimes(1);
    fireEvent.pointerMove(container.querySelector("[data-chart-index]")!);
    expect(container.querySelector(".st-wordCloudChart__tooltip")).not.toBeNull();
  });
});
