import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { ChordDiagram, PackedBubblesChart } from "./index.js";
import type { ChordDiagramFlow, PackedBubblesChartDatum } from "./index.js";

describe("ChordDiagram parity with Svelte", () => {
  const flows: ChordDiagramFlow[] = [
    { from: "A", to: "B", value: 10 },
    { from: "B", to: "C", value: 6 },
    { from: "C", to: "A", value: 4 },
  ];

  it("renders one arc per node, one ribbon per flow, role img and SR list", () => {
    const wrapper = mount(ChordDiagram, { props: { data: flows, label: "Flux" } });

    expect(wrapper.find('[role="img"][aria-label="Flux"]').exists()).toBe(true);
    expect(wrapper.findAll(".st-chordDiagram__arc")).toHaveLength(3);
    expect(wrapper.findAll(".st-chordDiagram__ribbon")).toHaveLength(3);

    const items = wrapper.findAll(".st-chartDataList li").map((n) => n.text());
    expect(items).toContain("A -> B: 10");
    expect(items).toContain("B -> C: 6");
    expect(wrapper.find(".st-chordDiagram__arc--category1").exists()).toBe(true);
  });

  it("uses labels map for display when provided", () => {
    const wrapper = mount(ChordDiagram, {
      props: { data: [{ from: "a", to: "b", value: 5 }], labels: { a: "Alpha", b: "Beta" }, label: "Libellés" },
    });
    const items = wrapper.findAll(".st-chartDataList li").map((n) => n.text());
    expect(items).toContain("Alpha -> Beta: 5");
  });

  it("ignores non-finite and non-positive flows without crashing", () => {
    const wrapper = mount(ChordDiagram, {
      props: {
        data: [
          { from: "A", to: "B", value: 10 },
          { from: "C", to: "D", value: NaN },
          { from: "E", to: "F", value: Infinity },
          { from: "G", to: "H", value: -3 },
          { from: "I", to: "J", value: 0 },
        ],
        label: "Filtrage",
      },
    });
    expect(wrapper.findAll(".st-chordDiagram__arc")).toHaveLength(2);
    expect(wrapper.findAll(".st-chordDiagram__ribbon")).toHaveLength(1);
    expect(wrapper.findAll(".st-chartDataList li")).toHaveLength(1);
  });

  it("renders nothing meaningful for empty data but does not crash", () => {
    const wrapper = mount(ChordDiagram, { props: { data: [], label: "Vide" } });
    expect(wrapper.findAll(".st-chordDiagram__arc")).toHaveLength(0);
    expect(wrapper.findAll(".st-chordDiagram__ribbon")).toHaveLength(0);
    expect(wrapper.find(".st-chartDataList").exists()).toBe(false);
  });

  it("shows and hides the tooltip on hover", async () => {
    const wrapper = mount(ChordDiagram, { props: { data: flows, label: "Interactif" } });
    expect(wrapper.find(".st-chordDiagram__tooltip").exists()).toBe(false);

    await wrapper.find(".st-chordDiagram__ribbon").trigger("pointermove");
    const tooltip = wrapper.find(".st-chordDiagram__tooltip");
    expect(tooltip.exists()).toBe(true);
    expect(tooltip.text()).toContain("A -> B");
    expect(tooltip.text()).toContain("10");

    await wrapper.find(".st-chordDiagram__visual").trigger("pointerleave");
    expect(wrapper.find(".st-chordDiagram__tooltip").exists()).toBe(false);
  });
});

describe("PackedBubblesChart parity with Svelte", () => {
  const data: PackedBubblesChartDatum[] = [
    { label: "Alpha", value: 100 },
    { label: "Beta", value: 50 },
    { label: "Gamma", value: 25 },
  ];

  it("renders one circle per datum with role img and SR list", () => {
    const wrapper = mount(PackedBubblesChart, { props: { data, label: "Bulles" } });

    expect(wrapper.find('[role="img"][aria-label="Bulles"]').exists()).toBe(true);
    const circles = wrapper.findAll(".st-packedBubblesChart__circle");
    expect(circles).toHaveLength(3);

    const radii = circles.map((c) => Number(c.attributes("r")));
    expect(Math.max(...radii)).toBeGreaterThan(Math.min(...radii));

    const items = wrapper.findAll(".st-chartDataList li").map((n) => n.text());
    expect(items).toContain("Alpha: 100");
    expect(items).toContain("Gamma: 25");
    expect(wrapper.find(".st-packedBubblesChart__circle--category1").exists()).toBe(true);
  });

  it("scales radius by sqrt(value): area ratio matches value ratio", () => {
    const wrapper = mount(PackedBubblesChart, {
      props: {
        data: [
          { label: "Big", value: 400 },
          { label: "Small", value: 100 },
        ],
        label: "Échelle",
      },
    });
    const radii = wrapper
      .findAll(".st-packedBubblesChart__circle")
      .map((c) => Number(c.attributes("r")))
      .sort((a, b) => b - a);
    expect(radii[0] / radii[1]).toBeCloseTo(2, 1);
  });

  it("ignores non-finite and non-positive values without crashing", () => {
    const wrapper = mount(PackedBubblesChart, {
      props: {
        data: [
          { label: "Ok", value: 10 },
          { label: "NaN", value: NaN },
          { label: "Inf", value: Infinity },
          { label: "Neg", value: -5 },
          { label: "Zero", value: 0 },
        ],
        label: "Filtrage",
      },
    });
    expect(wrapper.findAll(".st-packedBubblesChart__circle")).toHaveLength(1);
    expect(wrapper.findAll(".st-chartDataList li")).toHaveLength(1);
  });

  it("renders nothing for empty data but does not crash", () => {
    const wrapper = mount(PackedBubblesChart, { props: { data: [], label: "Vide" } });
    expect(wrapper.findAll(".st-packedBubblesChart__circle")).toHaveLength(0);
    expect(wrapper.find(".st-chartDataList").exists()).toBe(false);
  });

  it("shows and hides the tooltip on hover", async () => {
    const wrapper = mount(PackedBubblesChart, { props: { data, label: "Interactif" } });
    expect(wrapper.find(".st-packedBubblesChart__tooltip").exists()).toBe(false);

    await wrapper.find(".st-packedBubblesChart__circle").trigger("pointermove");
    const tooltip = wrapper.find(".st-packedBubblesChart__tooltip");
    expect(tooltip.exists()).toBe(true);
    expect(tooltip.text()).toContain("Alpha");
    expect(tooltip.text()).toContain("100");

    await wrapper.find(".st-packedBubblesChart__visual").trigger("pointerleave");
    expect(wrapper.find(".st-packedBubblesChart__tooltip").exists()).toBe(false);
  });
});
