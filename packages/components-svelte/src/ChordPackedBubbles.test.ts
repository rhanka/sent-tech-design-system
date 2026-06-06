import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import ChordDiagram from "./lib/ChordDiagram.svelte";
import type { ChordDiagramFlow } from "./lib/ChordDiagram.svelte";
import PackedBubblesChart from "./lib/PackedBubblesChart.svelte";
import type { PackedBubblesChartDatum } from "./lib/PackedBubblesChart.svelte";

describe("ChordDiagram", () => {
  const flows: ChordDiagramFlow[] = [
    { from: "A", to: "B", value: 10 },
    { from: "B", to: "C", value: 6 },
    { from: "C", to: "A", value: 4 }
  ];

  it("renders one arc per node, one ribbon per flow, role img and SR list", () => {
    const { container } = render(ChordDiagram, {
      props: { data: flows, label: "Flux" }
    });

    expect(screen.getByRole("img", { name: "Flux" })).toBeTruthy();

    // 3 nœuds distincts (A, B, C) -> 3 arcs.
    expect(container.querySelectorAll(".st-chordDiagram__arc").length).toBe(3);
    // 3 flux -> 3 rubans.
    expect(container.querySelectorAll(".st-chordDiagram__ribbon").length).toBe(3);

    const list = container.querySelector(".st-chartDataList");
    expect(list?.textContent).toContain("A -> B: 10");
    expect(list?.textContent).toContain("B -> C: 6");

    expect(container.querySelector(".st-chordDiagram__arc--category1")).toBeTruthy();
  });

  it("uses labels map for display when provided", () => {
    const { container } = render(ChordDiagram, {
      props: {
        data: [{ from: "a", to: "b", value: 5 }],
        labels: { a: "Alpha", b: "Beta" },
        label: "Libellés"
      }
    });
    const list = container.querySelector(".st-chartDataList");
    expect(list?.textContent).toContain("Alpha -> Beta: 5");
  });

  it("ignores non-finite and non-positive flows without crashing", () => {
    const { container } = render(ChordDiagram, {
      props: {
        data: [
          { from: "A", to: "B", value: 10 },
          { from: "C", to: "D", value: NaN },
          { from: "E", to: "F", value: Infinity },
          { from: "G", to: "H", value: -3 },
          { from: "I", to: "J", value: 0 }
        ] as ChordDiagramFlow[],
        label: "Filtrage"
      }
    });
    // Seul le 1er flux est valide -> 2 nœuds (A,B), 1 ruban.
    expect(container.querySelectorAll(".st-chordDiagram__arc").length).toBe(2);
    expect(container.querySelectorAll(".st-chordDiagram__ribbon").length).toBe(1);
    expect(container.querySelectorAll(".st-chartDataList li").length).toBe(1);
  });

  it("renders nothing meaningful for empty data but does not crash", () => {
    const { container } = render(ChordDiagram, {
      props: { data: [] as ChordDiagramFlow[], label: "Vide" }
    });
    expect(container.querySelectorAll(".st-chordDiagram__arc").length).toBe(0);
    expect(container.querySelectorAll(".st-chordDiagram__ribbon").length).toBe(0);
    expect(container.querySelector(".st-chartDataList")).toBeNull();
  });

  it("shows and hides the tooltip on hover", async () => {
    const { container } = render(ChordDiagram, {
      props: { data: flows, label: "Interactif" }
    });
    expect(screen.queryByRole("presentation")).toBeNull();

    const ribbons = container.querySelectorAll(".st-chordDiagram__ribbon");
    await fireEvent.pointerMove(ribbons[0]);
    const tooltip = screen.getByRole("presentation");
    expect(tooltip.textContent).toContain("A -> B");
    expect(tooltip.textContent).toContain("10");

    await fireEvent.pointerLeave(container.querySelector(".st-chordDiagram__visual") as Element);
    expect(screen.queryByRole("presentation")).toBeNull();
  });
});

describe("PackedBubblesChart", () => {
  const data: PackedBubblesChartDatum[] = [
    { label: "Alpha", value: 100 },
    { label: "Beta", value: 50 },
    { label: "Gamma", value: 25 }
  ];

  it("renders one circle per datum with role img and SR list", () => {
    const { container } = render(PackedBubblesChart, {
      props: { data, label: "Bulles" }
    });

    expect(screen.getByRole("img", { name: "Bulles" })).toBeTruthy();

    const circles = container.querySelectorAll(".st-packedBubblesChart__circle");
    expect(circles.length).toBe(3);

    // Aire ∝ value : la plus grosse valeur a le plus grand rayon.
    const radii = [...circles].map((c) => Number(c.getAttribute("r")));
    expect(Math.max(...radii)).toBeGreaterThan(Math.min(...radii));

    const list = container.querySelector(".st-chartDataList");
    expect(list?.textContent).toContain("Alpha: 100");
    expect(list?.textContent).toContain("Gamma: 25");

    expect(container.querySelector(".st-packedBubblesChart__circle--category1")).toBeTruthy();
  });

  it("scales radius by sqrt(value): area ratio matches value ratio", () => {
    const { container } = render(PackedBubblesChart, {
      props: {
        data: [
          { label: "Big", value: 400 },
          { label: "Small", value: 100 }
        ],
        label: "Échelle"
      }
    });
    const circles = container.querySelectorAll(".st-packedBubblesChart__circle");
    const radii = [...circles].map((c) => Number(c.getAttribute("r"))).sort((a, b) => b - a);
    // value 400 vs 100 -> rayon ratio = sqrt(4) = 2.
    expect(radii[0] / radii[1]).toBeCloseTo(2, 1);
  });

  it("ignores non-finite and non-positive values without crashing", () => {
    const { container } = render(PackedBubblesChart, {
      props: {
        data: [
          { label: "Ok", value: 10 },
          { label: "NaN", value: NaN },
          { label: "Inf", value: Infinity },
          { label: "Neg", value: -5 },
          { label: "Zero", value: 0 }
        ] as PackedBubblesChartDatum[],
        label: "Filtrage"
      }
    });
    expect(container.querySelectorAll(".st-packedBubblesChart__circle").length).toBe(1);
    expect(container.querySelectorAll(".st-chartDataList li").length).toBe(1);
  });

  it("renders nothing for empty data but does not crash", () => {
    const { container } = render(PackedBubblesChart, {
      props: { data: [] as PackedBubblesChartDatum[], label: "Vide" }
    });
    expect(container.querySelectorAll(".st-packedBubblesChart__circle").length).toBe(0);
    expect(container.querySelector(".st-chartDataList")).toBeNull();
  });

  it("shows and hides the tooltip on hover", async () => {
    const { container } = render(PackedBubblesChart, {
      props: { data, label: "Interactif" }
    });
    expect(screen.queryByRole("presentation")).toBeNull();

    const circles = container.querySelectorAll(".st-packedBubblesChart__circle");
    await fireEvent.pointerMove(circles[0]);
    const tooltip = screen.getByRole("presentation");
    expect(tooltip.textContent).toContain("Alpha");
    expect(tooltip.textContent).toContain("100");

    await fireEvent.pointerLeave(container.querySelector(".st-packedBubblesChart__visual") as Element);
    expect(screen.queryByRole("presentation")).toBeNull();
  });
});
