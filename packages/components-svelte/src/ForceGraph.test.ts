import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import ForceGraph from "./lib/ForceGraph.svelte";
import GraphLegend from "./lib/GraphLegend.svelte";
import { nodeShapePath, edgeDashArray } from "./lib/ForceGraph.svelte";
import type {
  ForceGraphNode,
  ForceGraphEdge,
  ForceGraphLegendEntry,
  ForceGraphEdgeDash
} from "./lib/ForceGraph.svelte";

// Approximate filled area of an SVG polygon/path made of straight segments.
// Parses M/L/Q (treats Q control as a vertex for a rough convex estimate is
// wrong; instead we sample). For our equal-area assertions we only use shapes
// built from straight M/L segments, so a shoelace over the L/M points is exact.
function polygonArea(d: string): number {
  const nums = d.match(/-?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?/g)?.map(Number) ?? [];
  const pts: [number, number][] = [];
  for (let i = 0; i + 1 < nums.length; i += 2) pts.push([nums[i], nums[i + 1]]);
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a) / 2;
}

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

  it("produces finite coordinates within the relaxed bounds for every node", () => {
    const w = 400;
    const h = 300;
    const { container } = render(ForceGraph, {
      props: { nodes, edges, label: "Bounded graph", width: w, height: h }
    });
    const groups = container.querySelectorAll(".st-forceGraph__node");
    expect(groups.length).toBe(4);
    // Soft clamp allows overflow up to half the canvas on each side so the
    // graph keeps a natural shape (fit-to-content reframes it afterwards).
    const padX = w * 0.5 + 20;
    const padY = h * 0.5 + 20;
    for (const g of groups) {
      const transform = g.getAttribute("transform") ?? "";
      const m = transform.match(/translate\(([-\d.]+) ([-\d.]+)\)/);
      expect(m).toBeTruthy();
      const x = Number(m?.[1]);
      const y = Number(m?.[2]);
      expect(Number.isFinite(x)).toBe(true);
      expect(Number.isFinite(y)).toBe(true);
      expect(x).toBeGreaterThanOrEqual(-padX);
      expect(x).toBeLessThanOrEqual(w + padX);
      expect(y).toBeGreaterThanOrEqual(-padY);
      expect(y).toBeLessThanOrEqual(h + padY);
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
    it("renders an SVG with a fit-to-content viewBox of four finite numbers", () => {
      const { container } = render(ForceGraph, {
        props: { nodes, edges, label: "Zoom test", width: 400, height: 300 }
      });
      const svg = container.querySelector("svg");
      expect(svg).toBeTruthy();
      const vb = (svg?.getAttribute("viewBox") ?? "").split(/\s+/).map(Number);
      expect(vb.length).toBe(4);
      for (const n of vb) expect(Number.isFinite(n)).toBe(true);
      // Width and height of the frame are positive.
      expect(vb[2]).toBeGreaterThan(0);
      expect(vb[3]).toBeGreaterThan(0);
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
      const before = svg.getAttribute("viewBox") ?? "";
      // Simulate a wheel event to trigger zoom
      await fireEvent.wheel(svg, { deltaY: 100, clientX: 200, clientY: 150 });
      // After zoom, viewBox should have changed from its initial value
      const vb = svg.getAttribute("viewBox") ?? "";
      expect(vb).not.toBe(before);
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

  // ---------------------------------------------------------------------------
  // Round-0.10.5 evolution 3: roundedbox shape
  // ---------------------------------------------------------------------------
  describe("roundedbox shape", () => {
    it("nodeShapePath returns a path with arcs for roundedbox", () => {
      const d = nodeShapePath("roundedbox", 7);
      expect(d).toBeTruthy();
      expect(d).toMatch(/^M /);
      expect(d).toContain("A"); // rounded corners use arc commands
      expect(d).toContain("Z");
    });

    it("renders a <path> for roundedbox nodes", () => {
      const shaped: ForceGraphNode[] = [{ id: "r", label: "R", shape: "roundedbox" }];
      const { container } = render(ForceGraph, {
        props: { nodes: shaped, edges: [], label: "Rounded" }
      });
      const dot = container.querySelector(".st-forceGraph__dot");
      expect(dot?.tagName.toLowerCase()).toBe("path");
    });
  });

  // ---------------------------------------------------------------------------
  // Round-0.10.5 evolution 4: equal-area shape calibration (≈ π·r²)
  // ---------------------------------------------------------------------------
  describe("equal-area shape calibration", () => {
    const r = 10;
    const target = Math.PI * r * r;

    it.each(["square", "box", "diamond", "hexagon", "triangle", "star"] as const)(
      "%s has an area within ~3%% of the reference circle π·r²",
      (shape) => {
        const d = nodeShapePath(shape, r)!;
        const area = polygonArea(d);
        expect(area).toBeGreaterThan(target * 0.97);
        expect(area).toBeLessThan(target * 1.03);
      }
    );

    it("square is calibrated to half-side √π/2·r (smaller than the old 0.85·r)", () => {
      const d = nodeShapePath("square", 100)!;
      const nums = d.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
      const maxAbs = Math.max(...nums.map(Math.abs));
      // half-side = √π/2·100 ≈ 88.6, distinctly different from the old 85.
      expect(maxAbs).toBeCloseTo((Math.sqrt(Math.PI) / 2) * 100, 1);
    });
  });

  // ---------------------------------------------------------------------------
  // Round-0.10.5 evolution 1: curved edges
  // ---------------------------------------------------------------------------
  describe("curved edges", () => {
    it("renders edges as <path> when edgeCurve > 0", () => {
      const { container } = render(ForceGraph, {
        props: { nodes, edges, label: "Curved", edgeCurve: 0.3 }
      });
      const edgeEls = container.querySelectorAll(".st-forceGraph__edge");
      expect(edgeEls.length).toBe(3);
      for (const el of edgeEls) {
        expect(el.tagName.toLowerCase()).toBe("path");
        expect(el.getAttribute("d")).toMatch(/Q/); // quadratic control point
      }
    });

    it("renders edges as straight <line> when edgeCurve = 0 (back-compat)", () => {
      const { container } = render(ForceGraph, {
        props: { nodes, edges, label: "Straight", edgeCurve: 0 }
      });
      const edgeEls = container.querySelectorAll(".st-forceGraph__edge");
      expect(edgeEls.length).toBe(3);
      for (const el of edgeEls) {
        expect(el.tagName.toLowerCase()).toBe("line");
      }
    });

    it("defaults to a light curve (paths, not lines)", () => {
      const { container } = render(ForceGraph, {
        props: { nodes, edges, label: "Default curve" }
      });
      const lines = container.querySelectorAll("line.st-forceGraph__edge");
      const paths = container.querySelectorAll("path.st-forceGraph__edge");
      expect(lines.length).toBe(0);
      expect(paths.length).toBe(3);
    });
  });

  // ---------------------------------------------------------------------------
  // Round-0.10.5 evolution 2: typed edge dash styles
  // ---------------------------------------------------------------------------
  describe("typed edge dash", () => {
    it("edgeDashArray maps styles to stroke-dasharrays", () => {
      expect(edgeDashArray("solid")).toBeNull();
      expect(edgeDashArray("dashed")).toBe("6 4");
      expect(edgeDashArray("dotted")).toBe("1 4");
      expect(edgeDashArray("long-dash")).toBe("12 6");
      // weak (no explicit dash) falls back to dashed.
      expect(edgeDashArray(undefined, true)).toBe("6 4");
      expect(edgeDashArray(undefined, false)).toBeNull();
      // explicit dash wins over weak.
      expect(edgeDashArray("dotted", true)).toBe("1 4");
    });

    it("applies the dash-array attribute to typed edges", () => {
      const dashEdges: ForceGraphEdge[] = [
        { source: "a", target: "b", dash: "dotted" },
        { source: "b", target: "c", dash: "long-dash" }
      ];
      const { container } = render(ForceGraph, {
        props: { nodes, edges: dashEdges, label: "Dash", edgeCurve: 0 }
      });
      const edgeEls = Array.from(container.querySelectorAll(".st-forceGraph__edge"));
      const dashes = edgeEls.map((el) => el.getAttribute("stroke-dasharray"));
      expect(dashes).toContain("1 4");
      expect(dashes).toContain("12 6");
    });

    it("legend edge swatch honours dash", () => {
      const legend: ForceGraphLegendEntry[] = [
        { label: "Dotted", dash: "dotted" }
      ];
      const { container } = render(ForceGraph, {
        props: { nodes, edges, label: "Dash legend", legend }
      });
      const line = container.querySelector(".st-forceGraph__legendEdge");
      expect(line?.getAttribute("stroke-dasharray")).toBe("1 4");
    });
  });

  // ---------------------------------------------------------------------------
  // Round-0.10.5 evolution 8: emphasised (bold) edges
  // ---------------------------------------------------------------------------
  describe("emphasised edges", () => {
    it("adds the emphasis class and a thicker stroke width", () => {
      const emphEdges: ForceGraphEdge[] = [
        { source: "a", target: "b", emphasis: true }
      ];
      const { container } = render(ForceGraph, {
        props: { nodes, edges: emphEdges, label: "Bold", edgeCurve: 0 }
      });
      const edge = container.querySelector(".st-forceGraph__edge");
      expect(edge?.classList.contains("st-forceGraph__edge--emphasis")).toBe(true);
      expect(Number(edge?.getAttribute("stroke-width"))).toBeGreaterThan(1);
    });

    it("honours an explicit width override", () => {
      const wEdges: ForceGraphEdge[] = [{ source: "a", target: "b", width: 5 }];
      const { container } = render(ForceGraph, {
        props: { nodes, edges: wEdges, label: "Width", edgeCurve: 0 }
      });
      const edge = container.querySelector(".st-forceGraph__edge");
      expect(edge?.getAttribute("stroke-width")).toBe("5");
    });
  });

  // ---------------------------------------------------------------------------
  // Round-0.10.5 evolution 5: fit-to-content viewBox
  // ---------------------------------------------------------------------------
  describe("fit-to-content viewBox", () => {
    it("frames every node (with margin) inside the initial viewBox", () => {
      const { container } = render(ForceGraph, {
        props: { nodes, edges, label: "Fit", width: 400, height: 300 }
      });
      const svg = container.querySelector("svg")!;
      const [vx, vy, vw, vh] = (svg.getAttribute("viewBox") ?? "").split(/\s+/).map(Number);
      const groups = container.querySelectorAll(".st-forceGraph__node");
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const g of groups) {
        const m = (g.getAttribute("transform") ?? "").match(/translate\(([-\d.]+) ([-\d.]+)\)/);
        const x = Number(m?.[1]);
        const y = Number(m?.[2]);
        minX = Math.min(minX, x); minY = Math.min(minY, y);
        maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
      }
      // Every node centre lies strictly inside the framed viewBox.
      expect(minX).toBeGreaterThanOrEqual(vx);
      expect(minY).toBeGreaterThanOrEqual(vy);
      expect(maxX).toBeLessThanOrEqual(vx + vw);
      expect(maxY).toBeLessThanOrEqual(vy + vh);
      // There is a non-zero margin on at least one axis (content < frame).
      const contentW = maxX - minX;
      const contentH = maxY - minY;
      expect(vw).toBeGreaterThan(contentW);
      expect(vh).toBeGreaterThan(contentH);
    });
  });

  // ---------------------------------------------------------------------------
  // Round-0.10.5 fix 6: selection keeps direct neighbours fully visible
  // ---------------------------------------------------------------------------
  describe("selection keeps neighbours visible", () => {
    // a-b, b-c, c-d. Select "b": neighbours a and c stay visible; only d dims.
    it("dims only non-neighbours when a node is selected", () => {
      const { container } = render(ForceGraph, {
        props: { nodes, edges, label: "Neighbours", selectedIds: ["b"] }
      });
      // Node order matches the nodes array: a, b, c, d.
      const [a, b, c, d] = Array.from(container.querySelectorAll(".st-forceGraph__node"));
      const dim = (el: Element) => el.classList.contains("st-forceGraph__node--dim");
      expect(dim(b)).toBe(false); // selected
      expect(dim(a)).toBe(false); // neighbour of b
      expect(dim(c)).toBe(false); // neighbour of b
      expect(dim(d)).toBe(true); // not connected to b
    });

    it("does not dim anything when there is no selection/focus", () => {
      const { container } = render(ForceGraph, {
        props: { nodes, edges, label: "No selection" }
      });
      const dimmed = container.querySelectorAll(".st-forceGraph__node--dim");
      expect(dimmed.length).toBe(0);
    });

    it("keeps the focused node's neighbours visible too", () => {
      const { container } = render(ForceGraph, {
        props: { nodes, edges, label: "Focus neighbours", focusId: "b" }
      });
      const [a, b, c, d] = Array.from(container.querySelectorAll(".st-forceGraph__node"));
      const dim = (el: Element) => el.classList.contains("st-forceGraph__node--dim");
      expect(dim(b)).toBe(false);
      expect(dim(a)).toBe(false);
      expect(dim(c)).toBe(false);
      expect(dim(d)).toBe(true);
    });

    it("dims edges that touch no selected/focused node", () => {
      const { container } = render(ForceGraph, {
        props: { nodes, edges, label: "Edge dim", selectedIds: ["a"] }
      });
      // edges: a-b (touches a, visible), b-c (dim), c-d (dim)
      const dimEdges = container.querySelectorAll(".st-forceGraph__edge--dim");
      expect(dimEdges.length).toBe(2);
    });
  });

  // ---------------------------------------------------------------------------
  // Round-0.10.5 fix 7: edge hover opacity matches node visibility
  // ---------------------------------------------------------------------------
  describe("edge hover opacity", () => {
    it("applies the hovered class (opacity raised to full) on edge hover", async () => {
      const { container } = render(ForceGraph, {
        props: { nodes, edges, label: "Hover opacity" }
      });
      const hit = container.querySelectorAll(".st-forceGraph__edgeHit");
      await fireEvent.mouseEnter(hit[0]);
      const hovered = container.querySelector(".st-forceGraph__edge--hovered");
      expect(hovered).toBeTruthy();
    });
  });

  // ---------------------------------------------------------------------------
  // Round-6 demand 6: adjustable repulsion prop
  // ---------------------------------------------------------------------------
  describe("repulsion prop", () => {
    // Read each node centre from its translate() transform.
    const centres = (container: Element) =>
      Array.from(container.querySelectorAll(".st-forceGraph__node")).map((g) => {
        const m = (g.getAttribute("transform") ?? "").match(
          /translate\(([-\d.]+) ([-\d.]+)\)/
        );
        return { x: Number(m?.[1]), y: Number(m?.[2]) };
      });

    it("renders without error with a high repulsion and accepts the prop", () => {
      const { container } = render(ForceGraph, {
        props: { nodes, edges, label: "Aéré", repulsion: 2 }
      });
      expect(container.querySelectorAll(".st-forceGraph__node").length).toBe(4);
      for (const c of centres(container)) {
        expect(Number.isFinite(c.x)).toBe(true);
        expect(Number.isFinite(c.y)).toBe(true);
      }
    });

    it("spreads nodes further apart at repulsion=2 than at repulsion=0.5", () => {
      // Mean pairwise distance grows with the repulsion factor (same seed/layout).
      const meanDist = (container: Element) => {
        const pts = centres(container);
        let sum = 0;
        let count = 0;
        for (let i = 0; i < pts.length; i++) {
          for (let j = i + 1; j < pts.length; j++) {
            sum += Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
            count++;
          }
        }
        return count ? sum / count : 0;
      };
      const compact = render(ForceGraph, {
        props: { nodes, edges, label: "Compact", repulsion: 0.5 }
      });
      const airy = render(ForceGraph, {
        props: { nodes, edges, label: "Airy", repulsion: 2 }
      });
      expect(meanDist(airy.container)).toBeGreaterThan(meanDist(compact.container));
    });

    it("does not break the fit-to-content viewBox (every node stays framed)", () => {
      const { container } = render(ForceGraph, {
        props: { nodes, edges, label: "Fit + repulsion", repulsion: 3, width: 400, height: 300 }
      });
      const svg = container.querySelector("svg")!;
      const [vx, vy, vw, vh] = (svg.getAttribute("viewBox") ?? "").split(/\s+/).map(Number);
      for (const c of centres(container)) {
        expect(c.x).toBeGreaterThanOrEqual(vx);
        expect(c.y).toBeGreaterThanOrEqual(vy);
        expect(c.x).toBeLessThanOrEqual(vx + vw);
        expect(c.y).toBeLessThanOrEqual(vy + vh);
      }
    });

    it("clamps extreme values without producing non-finite coordinates", () => {
      const { container } = render(ForceGraph, {
        props: { nodes, edges, label: "Extreme", repulsion: 9999 }
      });
      for (const c of centres(container)) {
        expect(Number.isFinite(c.x)).toBe(true);
        expect(Number.isFinite(c.y)).toBe(true);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Round-6 demand 7: hover-connexe (dim non-neighbour nodes AND edges)
  // ---------------------------------------------------------------------------
  describe("hover-connexe", () => {
    // edges: a-b, b-c, c-d. Hovering "b": a and c stay full, d dims; edges a-b
    // and b-c stay full, c-d dims.
    const dim = (el: Element) => el.classList.contains("st-forceGraph__node--dim");
    const edgeDim = (el: Element) => el.classList.contains("st-forceGraph__edge--dim");

    it("dims non-neighbour nodes (not the hovered node nor its neighbours)", async () => {
      const { container } = render(ForceGraph, {
        props: { nodes, edges, label: "Hover connexe nodes" }
      });
      const [a, b, c, d] = Array.from(container.querySelectorAll(".st-forceGraph__node"));
      const bDot = b.querySelector(".st-forceGraph__dot")!;
      await fireEvent.mouseEnter(bDot);
      expect(dim(b)).toBe(false); // hovered
      expect(dim(a)).toBe(false); // neighbour
      expect(dim(c)).toBe(false); // neighbour
      expect(dim(d)).toBe(true); // not connected
    });

    it("dims edges not incident to the hovered node", async () => {
      const { container } = render(ForceGraph, {
        props: { nodes, edges, label: "Hover connexe edges" }
      });
      const b = container.querySelectorAll(".st-forceGraph__node")[1];
      const bDot = b.querySelector(".st-forceGraph__dot")!;
      await fireEvent.mouseEnter(bDot);
      const edgeEls = Array.from(container.querySelectorAll(".st-forceGraph__edge"));
      // edges order: a-b, b-c, c-d. a-b and b-c are incident to b → not dim.
      expect(edgeDim(edgeEls[0])).toBe(false); // a-b
      expect(edgeDim(edgeEls[1])).toBe(false); // b-c
      expect(edgeDim(edgeEls[2])).toBe(true); // c-d
    });

    it("removes all dimming once the hover ends", async () => {
      const { container } = render(ForceGraph, {
        props: { nodes, edges, label: "Hover clear" }
      });
      const b = container.querySelectorAll(".st-forceGraph__node")[1];
      const bDot = b.querySelector(".st-forceGraph__dot")!;
      await fireEvent.mouseEnter(bDot);
      expect(container.querySelectorAll(".st-forceGraph__node--dim").length).toBeGreaterThan(0);
      await fireEvent.mouseLeave(bDot);
      expect(container.querySelectorAll(".st-forceGraph__node--dim").length).toBe(0);
      expect(container.querySelectorAll(".st-forceGraph__edge--dim").length).toBe(0);
    });

    it("calls onNodeHover with the node on enter and null on leave", async () => {
      const spy = vi.fn();
      const { container } = render(ForceGraph, {
        props: { nodes, edges, label: "Hover cb", onNodeHover: spy }
      });
      const b = container.querySelectorAll(".st-forceGraph__node")[1];
      const bDot = b.querySelector(".st-forceGraph__dot")!;
      await fireEvent.mouseEnter(bDot);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0]).toMatchObject({ id: "b" });
      await fireEvent.mouseLeave(bDot);
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy.mock.calls[1][0]).toBeNull();
    });

    it("composes hover with selection (both predicates OR'd)", async () => {
      // Select "a": by selection, a + neighbour b stay full; c and d dim.
      // Now hover "c": by hover, c + neighbours b,d stay full; a dims.
      // The dim class is the OR of both predicates, so:
      //   - a: selection-full but hover-dim  -> dim
      //   - d: selection-dim but hover-full   -> dim
      //   - b: full in both                   -> not dim
      const { container } = render(ForceGraph, {
        props: { nodes, edges, label: "Hover + selection", selectedIds: ["a"] }
      });
      const [a, b, c, d] = Array.from(container.querySelectorAll(".st-forceGraph__node"));
      const cDot = c.querySelector(".st-forceGraph__dot")!;
      await fireEvent.mouseEnter(cDot);
      expect(dim(b)).toBe(false); // full under both selection and hover
      expect(dim(a)).toBe(true); // hover-dimmed (not a neighbour of c)
      expect(dim(d)).toBe(true); // selection-dimmed (not a neighbour of a)
    });

    it("does not require onNodeHover (optional prop, no error)", async () => {
      const { container } = render(ForceGraph, {
        props: { nodes, edges, label: "No hover cb" }
      });
      const dot = container.querySelector(".st-forceGraph__dot")!;
      await expect(fireEvent.mouseEnter(dot)).resolves.toBeTruthy();
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
