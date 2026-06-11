import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { ItemChart } from "./ItemChart.js";

// Hémicycle « parlement » : chaque groupe apporte `value` sièges (pastilles),
// les sièges d'un même groupe sont contigus et colorés par ton catégoriel.
const groups = [
  { label: "Gauche", value: 40 },
  { label: "Centre", value: 22, tone: "category5" as const },
  { label: "Droite", value: 80 },
  { label: "Indép.", value: 8 },
];

const seats = (el: HTMLElement) =>
  Array.from(el.querySelectorAll(".st-itemChart__seat"));

const listItems = (el: HTMLElement) =>
  Array.from(el.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("ItemChart", () => {
  it("renders one seat per point (total = sum of values) inside a role=img", () => {
    const wrapper = mount(ItemChart, { props: { label: "Sièges", data: groups } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector("[role='img']")).toBeTruthy();
    const total = groups.reduce((sum, g) => sum + g.value, 0);
    expect(seats(el).length).toBe(total);
  });

  it("colors each group's seats with a contiguous categorical block", () => {
    const wrapper = mount(ItemChart, { props: { label: "Sièges", data: groups } });
    const all = seats(wrapper.element as HTMLElement);
    // Premier bloc = category1 (Gauche, 40 sièges), bloc suivant = category5 (Centre).
    expect(all[0].classList.contains("st-itemChart__seat--category1")).toBe(true);
    expect(all[39].classList.contains("st-itemChart__seat--category1")).toBe(true);
    expect(all[40].classList.contains("st-itemChart__seat--category5")).toBe(true);
    // Comptage par ton = valeurs des groupes.
    const count = (tone: string) => all.filter((s) => s.classList.contains(tone)).length;
    expect(count("st-itemChart__seat--category1")).toBe(40);
    expect(count("st-itemChart__seat--category5")).toBe(22);
    expect(count("st-itemChart__seat--category3")).toBe(80);
  });

  it("tags each seat with its group index for hover dimming", () => {
    const wrapper = mount(ItemChart, { props: { label: "Sièges", data: groups } });
    const idx = seats(wrapper.element as HTMLElement).map((s) => Number(s.getAttribute("data-chart-index")));
    expect(idx[0]).toBe(0);
    expect(idx[40]).toBe(1);
    expect(new Set(idx).size).toBe(groups.length);
  });

  it("renders a legend item with label and seat count per group", () => {
    const wrapper = mount(ItemChart, { props: { label: "Sièges", data: groups } });
    const items = Array.from((wrapper.element as HTMLElement).querySelectorAll(".st-itemChart__legendItem"));
    expect(items.length).toBe(groups.length);
    expect(items[0].textContent).toContain("Gauche");
    expect(items[0].textContent).toContain("40");
  });

  it("drops negative and non-finite values (zero seats for those groups)", () => {
    const wrapper = mount(ItemChart, {
      props: {
        label: "Filtré",
        data: [
          { label: "A", value: 10 },
          { label: "B", value: -5 },
          { label: "C", value: Number.NaN },
          { label: "D", value: 6 },
        ],
      },
    });
    const el = wrapper.element as HTMLElement;
    expect(seats(el).length).toBe(16);
    const idx = seats(el).map((s) => Number(s.getAttribute("data-chart-index")));
    expect(idx.includes(1)).toBe(false);
    expect(idx.includes(2)).toBe(false);
  });

  it("renders nothing in the SVG when the total is zero, without crashing", () => {
    const wrapper = mount(ItemChart, { props: { label: "Vide", data: [{ label: "X", value: 0 }] } });
    const el = wrapper.element as HTMLElement;
    expect(seats(el).length).toBe(0);
    expect(el.querySelector("[role='img']")).toBeTruthy();
  });

  it("summarizes each group in the accessible list as 'label: count'", () => {
    const wrapper = mount(ItemChart, { props: { label: "Sièges", data: groups } });
    const items = listItems(wrapper.element as HTMLElement);
    expect(items.length).toBe(groups.length);
    expect(items[0]).toBe("Gauche: 40");
    expect(items[1]).toBe("Centre: 22");
  });
});
