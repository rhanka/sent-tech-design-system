import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { VennChart } from "./VennChart.js";
import type { VennChartArea } from "./VennChart.js";

const data: VennChartArea[] = [
  { sets: ["A"], value: 10 },
  { sets: ["B"], value: 8 },
  { sets: ["A", "B"], value: 3 },
];

const data3: VennChartArea[] = [
  { sets: ["A"], value: 12 },
  { sets: ["B"], value: 9 },
  { sets: ["C"], value: 7 },
  { sets: ["A", "B"], value: 4 },
  { sets: ["A", "C"], value: 3 },
  { sets: ["B", "C"], value: 2 },
  { sets: ["A", "B", "C"], value: 1 },
];

const listItems = (el: HTMLElement) =>
  Array.from(el.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("VennChart", () => {
  it("renders one circle per set with role=img (2 sets)", () => {
    const wrapper = mount(VennChart, { props: { label: "Overlap", data } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector('[role="img"][aria-label="Overlap"]')).toBeTruthy();
    expect(el.querySelectorAll(".st-vennChart__circle").length).toBe(2);
  });

  it("renders three circles for a 3-set diagram", () => {
    const wrapper = mount(VennChart, { props: { label: "Triple", data: data3 } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-vennChart__circle").length).toBe(3);
  });

  it("summarizes each area (sets → value) in the accessible list", () => {
    const wrapper = mount(VennChart, { props: { label: "Overlap", data } });
    expect(listItems(wrapper.element as HTMLElement)).toEqual(["A: 10", "B: 8", "A ∩ B: 3"]);
  });

  it("labels intersection regions with their value", () => {
    const wrapper = mount(VennChart, { props: { label: "Overlap", data } });
    const el = wrapper.element as HTMLElement;
    const values = Array.from(el.querySelectorAll(".st-vennChart__value")).map((n) => n.textContent?.trim());
    expect(values).toEqual(["3"]);
  });

  it("renders the set name labels", () => {
    const wrapper = mount(VennChart, { props: { label: "Overlap", data } });
    const el = wrapper.element as HTMLElement;
    const labels = Array.from(el.querySelectorAll(".st-vennChart__label")).map((n) => n.textContent?.trim());
    expect(labels).toEqual(["A", "B"]);
  });

  it("maps radius by total set size (sqrt scaling): larger total yields a larger circle", () => {
    const wrapper = mount(VennChart, {
      props: {
        label: "Radius",
        data: [
          { sets: ["Small"], value: 1 },
          { sets: ["Big"], value: 100 },
          { sets: ["Small", "Big"], value: 1 },
        ],
      },
    });
    const el = wrapper.element as HTMLElement;
    const circles = Array.from(el.querySelectorAll<SVGCircleElement>(".st-vennChart__circle"));
    const r0 = Number(circles[0].getAttribute("r"));
    const r1 = Number(circles[1].getAttribute("r"));
    expect(r1).toBeGreaterThan(r0);
  });

  it("applies a category tone class per circle", () => {
    const wrapper = mount(VennChart, { props: { label: "Tone", data } });
    const el = wrapper.element as HTMLElement;
    const circles = el.querySelectorAll(".st-vennChart__circle");
    expect(circles[0].classList.contains("st-vennChart__circle--category1")).toBe(true);
    expect(circles[1].classList.contains("st-vennChart__circle--category2")).toBe(true);
  });

  it("renders empty without crashing for an empty dataset", () => {
    const wrapper = mount(VennChart, { props: { label: "Empty", data: [] } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-vennChart__circle").length).toBe(0);
    expect(listItems(el)).toEqual([]);
  });

  it("shows, updates, and hides tooltip on interactions", async () => {
    const wrapper = mount(VennChart, { props: { label: "Interactive", data } });
    const el = wrapper.element as HTMLElement;

    expect(el.querySelector('[role="presentation"]')).toBeNull();

    await wrapper.find(".st-vennChart__circle:nth-child(2)").trigger("pointermove");

    expect(el.querySelector('[role="presentation"]')).toBeTruthy();
    expect(el.querySelector(".st-vennChart__tooltipLabel")?.textContent).toBe("B");

    await wrapper.find(".st-vennChart__visual").trigger("pointerleave");
    expect(el.querySelector('[role="presentation"]')).toBeNull();
  });
});
