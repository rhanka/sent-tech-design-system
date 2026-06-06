import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ChordDiagram, PackedBubblesChart } from "./index.js";
import type { ChordDiagramFlow, PackedBubblesChartDatum } from "./index.js";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

describe("ChordDiagram parity with Svelte", () => {
  const flows: ChordDiagramFlow[] = [
    { from: "A", to: "B", value: 10 },
    { from: "B", to: "C", value: 6 },
    { from: "C", to: "A", value: 4 },
  ];

  it("renders one arc per node, one ribbon per flow, role img and SR list", () => {
    const { container } = render(<ChordDiagram data={flows} label="Flux" />);

    expect(container.querySelector(".st-chordDiagram__visual")?.getAttribute("aria-label")).toBe("Flux");
    expect(container.querySelectorAll(".st-chordDiagram__arc")).toHaveLength(3);
    expect(container.querySelectorAll(".st-chordDiagram__ribbon")).toHaveLength(3);

    const items = Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent);
    expect(items).toContain("A -> B: 10");
    expect(items).toContain("B -> C: 6");
    expect(container.querySelector(".st-chordDiagram__arc--category1")).toBeTruthy();
  });

  it("uses labels map for display when provided", () => {
    const { container } = render(
      <ChordDiagram data={[{ from: "a", to: "b", value: 5 }]} labels={{ a: "Alpha", b: "Beta" }} label="Libellés" />,
    );
    const items = Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent);
    expect(items).toContain("Alpha -> Beta: 5");
  });

  it("ignores non-finite and non-positive flows without crashing", () => {
    const { container } = render(
      <ChordDiagram
        data={[
          { from: "A", to: "B", value: 10 },
          { from: "C", to: "D", value: NaN },
          { from: "E", to: "F", value: Infinity },
          { from: "G", to: "H", value: -3 },
          { from: "I", to: "J", value: 0 },
        ]}
        label="Filtrage"
      />,
    );
    expect(container.querySelectorAll(".st-chordDiagram__arc")).toHaveLength(2);
    expect(container.querySelectorAll(".st-chordDiagram__ribbon")).toHaveLength(1);
    expect(container.querySelectorAll(".st-chartDataList li")).toHaveLength(1);
  });

  it("renders nothing meaningful for empty data but does not crash", () => {
    const { container } = render(<ChordDiagram data={[]} label="Vide" />);
    expect(container.querySelectorAll(".st-chordDiagram__arc")).toHaveLength(0);
    expect(container.querySelectorAll(".st-chordDiagram__ribbon")).toHaveLength(0);
    expect(container.querySelector(".st-chartDataList")).toBeNull();
  });

  it("shows and hides the tooltip on hover", () => {
    const { container } = render(<ChordDiagram data={flows} label="Interactif" />);
    expect(screen.queryByRole("presentation")).toBeNull();

    const ribbons = container.querySelectorAll(".st-chordDiagram__ribbon");
    fireEvent.pointerMove(ribbons[0]);
    const tooltip = screen.getByRole("presentation");
    expect(tooltip.textContent).toContain("A -> B");
    expect(tooltip.textContent).toContain("10");

    fireEvent.pointerLeave(container.querySelector(".st-chordDiagram__visual") as Element);
    expect(screen.queryByRole("presentation")).toBeNull();
  });
});

describe("PackedBubblesChart parity with Svelte", () => {
  const data: PackedBubblesChartDatum[] = [
    { label: "Alpha", value: 100 },
    { label: "Beta", value: 50 },
    { label: "Gamma", value: 25 },
  ];

  it("renders one circle per datum with role img and SR list", () => {
    const { container } = render(<PackedBubblesChart data={data} label="Bulles" />);

    expect(container.querySelector(".st-packedBubblesChart__visual")?.getAttribute("aria-label")).toBe("Bulles");
    const circles = container.querySelectorAll(".st-packedBubblesChart__circle");
    expect(circles).toHaveLength(3);

    const radii = Array.from(circles).map((c) => Number(c.getAttribute("r")));
    expect(Math.max(...radii)).toBeGreaterThan(Math.min(...radii));

    const items = Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent);
    expect(items).toContain("Alpha: 100");
    expect(items).toContain("Gamma: 25");
    expect(container.querySelector(".st-packedBubblesChart__circle--category1")).toBeTruthy();
  });

  it("scales radius by sqrt(value): area ratio matches value ratio", () => {
    const { container } = render(
      <PackedBubblesChart
        data={[
          { label: "Big", value: 400 },
          { label: "Small", value: 100 },
        ]}
        label="Échelle"
      />,
    );
    const radii = Array.from(container.querySelectorAll(".st-packedBubblesChart__circle"))
      .map((c) => Number(c.getAttribute("r")))
      .sort((a, b) => b - a);
    expect(radii[0] / radii[1]).toBeCloseTo(2, 1);
  });

  it("ignores non-finite and non-positive values without crashing", () => {
    const { container } = render(
      <PackedBubblesChart
        data={[
          { label: "Ok", value: 10 },
          { label: "NaN", value: NaN },
          { label: "Inf", value: Infinity },
          { label: "Neg", value: -5 },
          { label: "Zero", value: 0 },
        ]}
        label="Filtrage"
      />,
    );
    expect(container.querySelectorAll(".st-packedBubblesChart__circle")).toHaveLength(1);
    expect(container.querySelectorAll(".st-chartDataList li")).toHaveLength(1);
  });

  it("renders nothing for empty data but does not crash", () => {
    const { container } = render(<PackedBubblesChart data={[]} label="Vide" />);
    expect(container.querySelectorAll(".st-packedBubblesChart__circle")).toHaveLength(0);
    expect(container.querySelector(".st-chartDataList")).toBeNull();
  });

  it("shows and hides the tooltip on hover", () => {
    const { container } = render(<PackedBubblesChart data={data} label="Interactif" />);
    expect(screen.queryByRole("presentation")).toBeNull();

    const circles = container.querySelectorAll(".st-packedBubblesChart__circle");
    fireEvent.pointerMove(circles[0]);
    const tooltip = screen.getByRole("presentation");
    expect(tooltip.textContent).toContain("Alpha");
    expect(tooltip.textContent).toContain("100");

    fireEvent.pointerLeave(container.querySelector(".st-packedBubblesChart__visual") as Element);
    expect(screen.queryByRole("presentation")).toBeNull();
  });
});
