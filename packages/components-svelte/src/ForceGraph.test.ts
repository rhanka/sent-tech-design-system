import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import ForceGraph from "./lib/ForceGraph.svelte";
import GraphLegend from "./lib/GraphLegend.svelte";
import { nodeShapePath } from "./lib/ForceGraph.svelte";
import type { ForceGraphNode, ForceGraphEdge, ForceGraphLegendEntry } from "./lib/ForceGraph.svelte";

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

  it("shows and hides a node tooltip on hover", async () => {
    const { container } = render(ForceGraph, {
      props: { nodes, edges, label: "Interactive graph" }
    });
    // Initially no tooltip
    expect(screen.queryAllByRole("presentation").length).toBe(0);

    const dots = container.querySelectorAll(".st-forceGraph__dot");
    await fireEvent.mouseEnter(dots[0]);

    const tooltips = screen.getAllByRole("presentation");
    expect(tooltips.length).toBeGreaterThan(0);
    expect(screen.getAllByText("Alpha").length).toBeGreaterThan(0);

    await fireEvent.mouseLeave(dots[0]);
    expect(screen.queryAllByRole("presentation").length).toBe(0);
  });

  // ---------------------------------------------------------------------------
  // Feature 1: Per-node shape
  // ---------------------------------------------------------------------------
  describe("per-node shape", () => {
    it("nodeShapePath returns null for dot/circle (use circle element)", () => {
      expect(nodeShapePath("dot", 7)).toBeNull();
      expect(nodeShapePath("circle", 7)).toBeNull();
      expect(nodeShapePath(undefined, 7)).toBeNull();
    });

    it("nodeShapePath returns a non-empty SVG path string for non-circle shapes", () => {
      const shapes = ["diamond", "star", "hexagon", "box", "square", "triangle"] as const;
      for (const s of shapes) {
        const d = nodeShapePath(s, 7);
        expect(d).toBeTruthy();
        expect(typeof d).toBe("string");
        // Must start with M and contain Z.
        expect(d).toMatch(/^M /);
        expect(d).toContain("Z");
      }
    });

    it("renders a <path> element for diamond-shaped nodes instead of <circle>", () => {
      const shaped: ForceGraphNode[] = [
        { id: "x", label: "X", shape: "diamond" },
        { id: "y", label: "Y" } // default circle
      ];
      const { container } = render(ForceGraph, {
        props: { nodes: shaped, edges: [], label: "Shape test" }
      });
      // shaped node uses <path>, default uses <circle>
      const paths = container.querySelectorAll(".st-forceGraph__dot");
      const pathTags = Array.from(paths).map((el) => el.tagName.toLowerCase());
      expect(pathTags).toContain("path");
      expect(pathTags).toContain("circle");
    });

    it("renders all non-circle shapes as <path> elements", () => {
      const shapes: ForceGraphNode["shape"][] = ["diamond", "star", "hexagon", "box", "square", "triangle"];
      const shaped: ForceGraphNode[] = shapes.map((shape, i) => ({
        id: `n${i}`,
        label: `Node ${i}`,
        shape
      }));
      const { container } = render(ForceGraph, {
        props: { nodes: shaped, edges: [], label: "All shapes" }
      });
      const dots = container.querySelectorAll(".st-forceGraph__dot");
      expect(dots.length).toBe(shapes.length);
      for (const dot of dots) {
        expect(dot.tagName.toLowerCase()).toBe("path");
      }
    });

    it("nodes without shape default to circle (no regression)", () => {
      const { container } = render(ForceGraph, {
        props: { nodes, edges, label: "Default circles" }
      });
      const dots = container.querySelectorAll(".st-forceGraph__dot");
      for (const dot of dots) {
        expect(dot.tagName.toLowerCase()).toBe("circle");
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Feature 2: Zoom + pan
  // ---------------------------------------------------------------------------
  describe("zoom + pan", () => {
    it("renders an SVG with initial viewBox matching width/height", () => {
      const { container } = render(ForceGraph, {
        props: { nodes, edges, label: "Zoom test", width: 400, height: 300 }
      });
      const svg = container.querySelector("svg");
      expect(svg).toBeTruthy();
      expect(svg?.getAttribute("viewBox")).toBe("0 0 400 300");
    });

    it("does not show reset button when not zoomed", () => {
      render(ForceGraph, { props: { nodes, edges, label: "No zoom" } });
      expect(screen.queryByRole("button", { name: "Reset view" })).toBeNull();
    });

    it("reset view button exists in DOM only when zoomed (viewBox changed)", async () => {
      const { container } = render(ForceGraph, {
        props: { nodes, edges, label: "Pan test", width: 400, height: 300 }
      });
      const svg = container.querySelector("svg")!;
      // Simulate a wheel event to trigger zoom
      await fireEvent.wheel(svg, { deltaY: 100, clientX: 200, clientY: 150 });
      // After zoom, viewBox should have changed from default
      const vb = svg.getAttribute("viewBox") ?? "";
      // The viewBox string should differ from "0 0 400 300"
      expect(vb).not.toBe("0 0 400 300");
    });
  });

  // ---------------------------------------------------------------------------
  // Feature 3: Edge hover tooltip + onEdgeHover callback
  // ---------------------------------------------------------------------------
  describe("edge hover", () => {
    it("shows an edge tooltip with source/relation/target on edge hover", async () => {
      const { container } = render(ForceGraph, {
        props: { nodes, edges, label: "Edge tooltip test" }
      });
      // Edge hit areas
      const hitLines = container.querySelectorAll(".st-forceGraph__edgeHit");
      expect(hitLines.length).toBe(3);

      // Hover the first hit area (a->b, relation: links_to)
      await fireEvent.mouseEnter(hitLines[0]);

      // Should show a tooltip with source/relation/target
      const tooltips = screen.getAllByRole("presentation");
      const edgeTooltip = tooltips.find((t) => t.className.includes("tooltip--edge"));
      expect(edgeTooltip).toBeTruthy();
      // Should contain both labels
      expect(edgeTooltip?.textContent).toContain("Alpha");
      expect(edgeTooltip?.textContent).toContain("Beta");
      expect(edgeTooltip?.textContent).toContain("links_to");
    });

    it("hides edge tooltip on mouse leave", async () => {
      const { container } = render(ForceGraph, {
        props: { nodes, edges, label: "Edge leave test" }
      });
      const hitLines = container.querySelectorAll(".st-forceGraph__edgeHit");
      await fireEvent.mouseEnter(hitLines[0]);
      const before = screen.getAllByRole("presentation");
      expect(before.length).toBeGreaterThan(0);

      await fireEvent.mouseLeave(hitLines[0]);
      // After mouse leave, no edge tooltip
      const edgeTooltips = screen
        .queryAllByRole("presentation")
        .filter((t) => t.className.includes("tooltip--edge"));
      expect(edgeTooltips.length).toBe(0);
    });

    it("fires onEdgeHover callback when hovering an edge", async () => {
      const spy = vi.fn();
      const { container } = render(ForceGraph, {
        props: { nodes, edges, label: "Edge hover cb", onEdgeHover: spy }
      });
      const hitLines = container.querySelectorAll(".st-forceGraph__edgeHit");
      await fireEvent.mouseEnter(hitLines[0]);
      expect(spy).toHaveBeenCalledOnce();
      expect(spy.mock.calls[0][0]).toMatchObject({ source: "a", target: "b", relation: "links_to" });
    });

    it("does not require onEdgeHover (optional prop, no error)", async () => {
      const { container } = render(ForceGraph, {
        props: { nodes, edges, label: "No edge hover cb" }
      });
      const hitLines = container.querySelectorAll(".st-forceGraph__edgeHit");
      // Should not throw
      await expect(fireEvent.mouseEnter(hitLines[0])).resolves.toBeTruthy();
    });

    it("shows edge relation even when edge has no relation field", async () => {
      const noRelEdges: ForceGraphEdge[] = [{ source: "a", target: "b" }];
      const { container } = render(ForceGraph, {
        props: { nodes: nodes.slice(0, 2), edges: noRelEdges, label: "No relation edge" }
      });
      const hitLines = container.querySelectorAll(".st-forceGraph__edgeHit");
      await fireEvent.mouseEnter(hitLines[0]);
      const tooltips = screen.getAllByRole("presentation");
      const edgeTooltip = tooltips.find((t) => t.className.includes("tooltip--edge"));
      // Should still show source and target labels
      expect(edgeTooltip?.textContent).toContain("Alpha");
      expect(edgeTooltip?.textContent).toContain("Beta");
    });
  });

  // ---------------------------------------------------------------------------
  // Feature 4: Legend overlay
  // ---------------------------------------------------------------------------
  describe("legend overlay", () => {
    const legendEntries: ForceGraphLegendEntry[] = [
      { label: "Concept", shape: "dot", tone: "category1" },
      { label: "Entity", shape: "diamond", tone: "category2" },
      { label: "Strong link" },
      { label: "Weak link", weak: true }
    ];

    it("does not render a legend when the prop is absent", () => {
      const { container } = render(ForceGraph, {
        props: { nodes, edges, label: "No legend" }
      });
      expect(container.querySelector(".st-forceGraph__legend")).toBeNull();
    });

    it("renders a legend overlay when legend prop is provided", () => {
      const { container } = render(ForceGraph, {
        props: { nodes, edges, label: "With legend", legend: legendEntries }
      });
      const legend = container.querySelector(".st-forceGraph__legend");
      expect(legend).toBeTruthy();
    });

    it("renders the correct number of legend entries", () => {
      const { container } = render(ForceGraph, {
        props: { nodes, edges, label: "Legend entries", legend: legendEntries }
      });
      const entries = container.querySelectorAll(".st-forceGraph__legendEntry");
      expect(entries.length).toBe(4);
    });

    it("legend entries contain the correct labels", () => {
      const { container } = render(ForceGraph, {
        props: { nodes, edges, label: "Legend labels", legend: legendEntries }
      });
      const labels = Array.from(container.querySelectorAll(".st-forceGraph__legendLabel")).map(
        (el) => el.textContent
      );
      expect(labels).toContain("Concept");
      expect(labels).toContain("Entity");
      expect(labels).toContain("Strong link");
      expect(labels).toContain("Weak link");
    });

    it("node legend entries render a swatch svg with path or circle", () => {
      const { container } = render(ForceGraph, {
        props: {
          nodes,
          edges,
          label: "Shape swatches",
          legend: [
            { label: "Dot", shape: "dot" },
            { label: "Diamond", shape: "diamond" }
          ]
        }
      });
      const swatches = container.querySelectorAll(".st-forceGraph__legendSwatch");
      expect(swatches.length).toBe(2);
      // diamond should contain a <path>
      const paths = container.querySelectorAll(".st-forceGraph__legendShape[d]");
      expect(paths.length).toBeGreaterThan(0);
    });

    it("edge legend entries render a line (weak variant has its class)", () => {
      const { container } = render(ForceGraph, {
        props: {
          nodes,
          edges,
          label: "Edge swatches",
          legend: [
            { label: "Strong" },
            { label: "Weak", weak: true }
          ]
        }
      });
      const weakLines = container.querySelectorAll(".st-forceGraph__legendEdge--weak");
      expect(weakLines.length).toBe(1);
    });
  });
});

// ---------------------------------------------------------------------------
// GraphLegend standalone component
// ---------------------------------------------------------------------------
describe("GraphLegend", () => {
  const entries: ForceGraphLegendEntry[] = [
    { label: "Type A", shape: "star", tone: "category3" },
    { label: "Type B", shape: "hexagon", tone: "category4" },
    { label: "Edge X" },
    { label: "Weak Y", weak: true }
  ];

  it("renders a legend with all entries", () => {
    const { container } = render(GraphLegend, { props: { entries } });
    const items = container.querySelectorAll(".st-graphLegend__entry");
    expect(items.length).toBe(4);
  });

  it("renders the title when provided", () => {
    render(GraphLegend, { props: { entries, title: "Legend title" } });
    expect(screen.getByText("Legend title")).toBeTruthy();
  });

  it("does not render a title element when title is absent", () => {
    const { container } = render(GraphLegend, { props: { entries } });
    expect(container.querySelector(".st-graphLegend__title")).toBeNull();
  });

  it("renders shape entries as svg with path/circle", () => {
    const { container } = render(GraphLegend, {
      props: {
        entries: [
          { label: "Star", shape: "star" },
          { label: "Circle", shape: "dot" }
        ]
      }
    });
    const swatches = container.querySelectorAll(".st-graphLegend__swatch");
    expect(swatches.length).toBe(2);
  });

  it("renders edge entries with a line element", () => {
    const { container } = render(GraphLegend, {
      props: {
        entries: [{ label: "Edge" }]
      }
    });
    const line = container.querySelector(".st-graphLegend__edge");
    expect(line).toBeTruthy();
  });

  it("applies weak class to weak edge entries", () => {
    const { container } = render(GraphLegend, {
      props: {
        entries: [{ label: "Weak", weak: true }]
      }
    });
    const weakLine = container.querySelector(".st-graphLegend__edge--weak");
    expect(weakLine).toBeTruthy();
  });

  it("labels are visible in the rendered output", () => {
    render(GraphLegend, { props: { entries } });
    expect(screen.getByText("Type A")).toBeTruthy();
    expect(screen.getByText("Type B")).toBeTruthy();
    expect(screen.getByText("Edge X")).toBeTruthy();
    expect(screen.getByText("Weak Y")).toBeTruthy();
  });
});
