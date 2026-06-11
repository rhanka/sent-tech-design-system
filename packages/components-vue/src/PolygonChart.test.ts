import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { PolygonChart } from "./PolygonChart.js";

// Polygone fermé rempli reliant des points x/y dans l'ordre fourni.
const cluster = [
  { x: 1, y: 1 },
  { x: 4, y: 2 },
  { x: 3, y: 5 },
  { x: 0, y: 3 },
];

const listItems = (el: HTMLElement) =>
  Array.from(el.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("PolygonChart", () => {
  it("renders one closed polygon and one vertex marker per point", () => {
    const wrapper = mount(PolygonChart, { props: { label: "Zone", data: cluster } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector("[role='img']")).toBeTruthy();
    expect(el.querySelectorAll(".st-polygonChart__polygon").length).toBe(1);
    expect(el.querySelectorAll(".st-polygonChart__vertex").length).toBe(cluster.length);
  });

  it("connects the points in order in the polygon `points` attribute", () => {
    const wrapper = mount(PolygonChart, { props: { label: "Zone", data: cluster } });
    const polygon = (wrapper.element as HTMLElement).querySelector(".st-polygonChart__polygon");
    const coords = (polygon!.getAttribute("points") ?? "").trim().split(/\s+/);
    expect(coords.length).toBe(cluster.length);
  });

  it("tones the polygon and vertices with the given tone", () => {
    const wrapper = mount(PolygonChart, { props: { label: "Zone", data: cluster, tone: "category3" } });
    const el = wrapper.element as HTMLElement;
    const polygon = el.querySelector(".st-polygonChart__polygon");
    expect(polygon!.classList.contains("st-polygonChart__polygon--category3")).toBe(true);
    const vertex = el.querySelector(".st-polygonChart__vertex");
    expect(vertex!.classList.contains("st-polygonChart__vertex--category3")).toBe(true);
  });

  it("defaults to category1 when no tone is given", () => {
    const wrapper = mount(PolygonChart, { props: { label: "Zone", data: cluster } });
    const polygon = (wrapper.element as HTMLElement).querySelector(".st-polygonChart__polygon");
    expect(polygon!.classList.contains("st-polygonChart__polygon--category1")).toBe(true);
  });

  it("drops non-finite coordinates before rendering vertices", () => {
    const wrapper = mount(PolygonChart, {
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
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-polygonChart__vertex").length).toBe(3);
  });

  it("does not draw a polygon with fewer than two points", () => {
    const wrapper = mount(PolygonChart, { props: { label: "Solo", data: [{ x: 1, y: 1 }] } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-polygonChart__polygon").length).toBe(0);
    expect(el.querySelectorAll(".st-polygonChart__vertex").length).toBe(1);
  });

  it("summarizes each point in the accessible list as 'x .., y ..'", () => {
    const wrapper = mount(PolygonChart, { props: { label: "Zone", data: cluster } });
    const items = listItems(wrapper.element as HTMLElement);
    expect(items.length).toBe(cluster.length);
    expect(items[0]).toBe("x 1, y 1");
  });
});
