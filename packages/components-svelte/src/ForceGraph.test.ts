import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import ForceGraph from "./lib/ForceGraph.svelte";
import type { ForceGraphNode, ForceGraphEdge } from "./lib/ForceGraph.svelte";

describe("ForceGraph", () => {
  const nodes: ForceGraphNode[] = [
    { id: "a", label: "Alpha", group: "g1" },
    { id: "b", label: "Beta", group: "g1" },
    { id: "c", label: "Gamma", group: "g2" },
    { id: "d", label: "Delta", tone: "category5" }
  ];
  const edges: ForceGraphEdge[] = [
    { source: "a", target: "b", relation: "links_to" },
    { source: "b", target: "c", relation: "links_to" },
    { source: "c", target: "d", relation: "weakly", weak: true }
  ];

  it("renders the figure, nodes and edges", () => {
    const { container } = render(ForceGraph, {
      props: { nodes, edges, label: "Demo graph" }
    });

    const wrapper = screen.getByRole("img", { name: "Demo graph" });
    expect(wrapper).toBeTruthy();
    expect(wrapper.className).toContain("st-forceGraph");

    const dots = container.querySelectorAll(".st-forceGraph__dot");
    expect(dots.length).toBe(4);

    const lines = container.querySelectorAll(".st-forceGraph__edge");
    expect(lines.length).toBe(3);

    // A weak edge is flagged for dashed styling.
    expect(container.querySelectorAll(".st-forceGraph__edge--weak").length).toBe(1);
  });

  it("assigns the same tone to nodes sharing a group and honours explicit tone", () => {
    const { container } = render(ForceGraph, {
      props: { nodes, edges, label: "Toned graph" }
    });
    const groupNodes = container.querySelectorAll(".st-forceGraph__node");
    const classOf = (i: number) => groupNodes[i].getAttribute("class") ?? "";
    // a + b share group g1 -> same category tone.
    const toneA = (classOf(0).match(/st-forceGraph__node--(category\d)/) ?? [])[1];
    const toneB = (classOf(1).match(/st-forceGraph__node--(category\d)/) ?? [])[1];
    expect(toneA).toBeTruthy();
    expect(toneA).toBe(toneB);
    // d has an explicit tone category5.
    expect(classOf(3)).toContain("st-forceGraph__node--category5");
  });

  it("produces finite, in-bounds coordinates for every node", () => {
    const { container } = render(ForceGraph, {
      props: { nodes, edges, label: "Bounded graph", width: 400, height: 300 }
    });
    const groups = container.querySelectorAll(".st-forceGraph__node");
    expect(groups.length).toBe(4);
    for (const g of groups) {
      const transform = g.getAttribute("transform") ?? "";
      const m = transform.match(/translate\(([-\d.]+) ([-\d.]+)\)/);
      expect(m).toBeTruthy();
      const x = Number(m?.[1]);
      const y = Number(m?.[2]);
      expect(Number.isFinite(x)).toBe(true);
      expect(Number.isFinite(y)).toBe(true);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(400);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(300);
    }
  });

  it("shows and hides a tooltip on hover", async () => {
    const { container } = render(ForceGraph, {
      props: { nodes, edges, label: "Interactive graph" }
    });
    expect(screen.queryByRole("presentation")).toBeNull();

    const dots = container.querySelectorAll(".st-forceGraph__dot");
    await fireEvent.mouseEnter(dots[0]);

    const tooltip = screen.getByRole("presentation");
    expect(tooltip).toBeTruthy();
    expect(screen.getAllByText("Alpha").length).toBeGreaterThan(0);

    await fireEvent.mouseLeave(dots[0]);
    expect(screen.queryByRole("presentation")).toBeNull();
  });
});
