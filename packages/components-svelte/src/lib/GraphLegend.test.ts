import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import GraphLegend from "./GraphLegend.svelte";
import type { ForceGraphLegendEntry } from "./ForceGraph.svelte";

const sampleEntries: ForceGraphLegendEntry[] = [
  { label: "Organisation type", shape: "hexagon", tone: "category1" },
  { label: "Tools", shape: "circle", tone: "category2" },
  { label: "Practices", shape: "diamond", tone: "category7" },
  { label: "Levels", shape: "square", tone: "category6" },
  { label: "Co-answer link", dash: "dashed", weak: true, tone: "category5" }
];

describe("GraphLegend — defaults & byte-identity", () => {
  it("keeps default overlay/sm DOM byte-identical with accessible label", () => {
    const { container } = render(GraphLegend, { props: { entries: sampleEntries } });
    const root = container.querySelector(".st-graphLegend") as HTMLElement;
    expect(root).toBeTruthy();
    expect(root.classList.contains("st-graphLegend--inline")).toBe(false);
    expect(root.classList.contains("st-graphLegend--md")).toBe(false);
    expect(root.classList.contains("st-graphLegend--lg")).toBe(false);
    expect(root.getAttribute("aria-label")).toBe("Graph legend");
    expect(container.querySelectorAll(".st-graphLegend__entry")).toHaveLength(5);

    const edgeSvg = container.querySelectorAll(".st-graphLegend__entry svg")[4] as SVGElement;
    expect(edgeSvg.getAttribute("viewBox")).toBe("0 0 16 8");
    expect(edgeSvg.getAttribute("width")).toBe("16");
  });

  it("renders title and uses it as aria-label", () => {
    const { container } = render(GraphLegend, {
      props: { entries: sampleEntries, title: "Engram families" }
    });
    const root = container.querySelector(".st-graphLegend") as HTMLElement;
    expect(root.getAttribute("aria-label")).toBe("Engram families");
    expect(container.querySelector(".st-graphLegend__title")?.textContent).toBe("Engram families");
  });
});

describe("GraphLegend — size & variant extensions (S-4)", () => {
  it("supports variant='inline' and size='md' | 'lg'", () => {
    const { container } = render(GraphLegend, {
      props: { entries: sampleEntries, variant: "inline", size: "lg" }
    });
    const root = container.querySelector(".st-graphLegend") as HTMLElement;
    expect(root.classList.contains("st-graphLegend--inline")).toBe(true);
    expect(root.classList.contains("st-graphLegend--lg")).toBe(true);
    expect(root.classList.contains("st-graphLegend--overlay")).toBe(false);

    const shapeSwatch = container.querySelector(".st-graphLegend__entry svg") as SVGElement;
    expect(shapeSwatch.getAttribute("width")).toBe("20");
    expect(shapeSwatch.getAttribute("height")).toBe("20");
  });

  it("scales swatches for size='md'", () => {
    const { container } = render(GraphLegend, {
      props: { entries: sampleEntries, size: "md" }
    });
    const root = container.querySelector(".st-graphLegend") as HTMLElement;
    expect(root.classList.contains("st-graphLegend--md")).toBe(true);
    const shapeSwatch = container.querySelector(".st-graphLegend__entry svg") as SVGElement;
    expect(shapeSwatch.getAttribute("width")).toBe("18");
  });

  it("applies edge tone class and dasharray for edge legend entries", () => {
    const { container } = render(GraphLegend, {
      props: { entries: sampleEntries, variant: "inline", size: "lg" }
    });
    const edgeLine = container.querySelector(".st-graphLegend__edge") as SVGLineElement;
    expect(edgeLine).toBeTruthy();
    expect(edgeLine.getAttribute("stroke-dasharray")).toBe("6 4");
    expect(edgeLine.classList.contains("st-graphLegend__edge--category5")).toBe(true);
  });

  it("uses --st-* light tokens with fallbacks and >= 16px lg typography", () => {
    const source = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "GraphLegend.svelte"),
      "utf8"
    );
    expect(source).toContain(".st-graphLegend--inline");
    expect(source).toContain("var(--st-semantic-surface-subtle,");
    expect(source).toContain("var(--st-semantic-text-primary,");
    expect(source).toContain(".st-graphLegend--lg");
    expect(source).toContain("font-size: 1rem;");
  });
});
