import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import PolygonChart from "./lib/PolygonChart.svelte";

// Polygone fermé rempli reliant des points x/y dans l'ordre fourni.
const cluster = [
  { x: 1, y: 1 },
  { x: 4, y: 2 },
  { x: 3, y: 5 },
  { x: 0, y: 3 },
];

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("PolygonChart", () => {
  it("renders one closed polygon and one vertex marker per point", () => {
    const { container } = render(PolygonChart, { props: { label: "Zone", data: cluster } });
    expect(screen.getByRole("img")).toBeTruthy();
    expect(container.querySelectorAll(".st-polygonChart__polygon").length).toBe(1);
    expect(container.querySelectorAll(".st-polygonChart__vertex").length).toBe(cluster.length);
  });

  it("connects the points in order in the polygon `points` attribute", () => {
    const { container } = render(PolygonChart, { props: { label: "Zone", data: cluster } });
    const polygon = container.querySelector(".st-polygonChart__polygon");
    const coords = (polygon!.getAttribute("points") ?? "").trim().split(/\s+/);
    expect(coords.length).toBe(cluster.length);
  });

  it("tones the polygon and vertices with the given tone", () => {
    const { container } = render(PolygonChart, { props: { label: "Zone", data: cluster, tone: "category3" } });
    const polygon = container.querySelector(".st-polygonChart__polygon");
    expect(polygon!.classList.contains("st-polygonChart__polygon--category3")).toBe(true);
    const vertex = container.querySelector(".st-polygonChart__vertex");
    expect(vertex!.classList.contains("st-polygonChart__vertex--category3")).toBe(true);
  });

  it("defaults to category1 when no tone is given", () => {
    const { container } = render(PolygonChart, { props: { label: "Zone", data: cluster } });
    const polygon = container.querySelector(".st-polygonChart__polygon");
    expect(polygon!.classList.contains("st-polygonChart__polygon--category1")).toBe(true);
  });

  it("drops non-finite coordinates before rendering vertices", () => {
    const { container } = render(PolygonChart, {
      props: {
        label: "Filtré",
        data: [
          { x: 0, y: 0 },
          { x: Number.NaN, y: 2 },
          { x: 3, y: Number.POSITIVE_INFINITY },
          { x: 4, y: 4 },
          { x: 2, y: 5 },
        ],
      },
    });
    expect(container.querySelectorAll(".st-polygonChart__vertex").length).toBe(3);
  });

  it("does not draw a polygon with fewer than two points", () => {
    const { container } = render(PolygonChart, { props: { label: "Solo", data: [{ x: 1, y: 1 }] } });
    expect(container.querySelectorAll(".st-polygonChart__polygon").length).toBe(0);
    expect(container.querySelectorAll(".st-polygonChart__vertex").length).toBe(1);
  });

  it("summarizes each point in the accessible list as 'x .., y ..'", () => {
    const { container } = render(PolygonChart, { props: { label: "Zone", data: cluster } });
    const items = listItems(container);
    expect(items.length).toBe(cluster.length);
    expect(items[0]).toBe("x 1, y 1");
  });
});
