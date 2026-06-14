import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { StatusHistoryChart } from "./StatusHistoryChart.js";

const services = [
  {
    series: "API",
    buckets: [
      { at: 0, value: "OK", tone: "success" as const },
      { at: 1, value: "Degraded", tone: "warning" as const },
      { at: 2, value: "OK", tone: "success" as const },
    ],
  },
  {
    series: "DB",
    buckets: [
      { at: 0, value: "OK", tone: "success" as const },
      { at: 1, value: "Down", tone: "error" as const },
      { at: 2, value: "OK", tone: "success" as const },
    ],
  },
];

const listItems = (el: HTMLElement) =>
  Array.from(el.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("StatusHistoryChart", () => {
  it("renders one cell per bucket across all rows", () => {
    const wrapper = mount(StatusHistoryChart, { props: { label: "Disponibilité", data: services } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector('[role="img"]')).toBeTruthy();
    expect(el.querySelectorAll(".st-statusHistoryChart__cell").length).toBe(6);
  });

  it("colours cells by explicit tone and renders a status legend", () => {
    const wrapper = mount(StatusHistoryChart, { props: { label: "Disponibilité", data: services } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector(".st-statusHistoryChart__cell--success")).toBeTruthy();
    expect(el.querySelector(".st-statusHistoryChart__cell--warning")).toBeTruthy();
    expect(el.querySelector(".st-statusHistoryChart__cell--error")).toBeTruthy();
    expect(el.querySelectorAll(".st-statusHistoryChart__legendItem").length).toBe(3);
  });

  it("derives a stable categoryN tone per status when no tone is given", () => {
    const wrapper = mount(StatusHistoryChart, {
      props: {
        label: "Phases",
        data: [
          {
            series: "Row",
            buckets: [
              { at: 0, value: "boot" },
              { at: 1, value: "run" },
              { at: 2, value: "boot" },
            ],
          },
        ],
      },
    });
    const cells = (wrapper.element as HTMLElement).querySelectorAll(".st-statusHistoryChart__cell");
    expect(cells[0].classList.contains("st-statusHistoryChart__cell--category1")).toBe(true);
    expect(cells[1].classList.contains("st-statusHistoryChart__cell--category2")).toBe(true);
    expect(cells[2].classList.contains("st-statusHistoryChart__cell--category1")).toBe(true);
  });

  it("lays buckets out as a time grid (later bucket sits to the right)", () => {
    const wrapper = mount(StatusHistoryChart, { props: { label: "P", data: services } });
    const cells = (wrapper.element as HTMLElement).querySelectorAll<SVGRectElement>(".st-statusHistoryChart__cell");
    const x0 = Number(cells[0].getAttribute("x"));
    const x1 = Number(cells[1].getAttribute("x"));
    expect(x1).toBeGreaterThan(x0);
  });

  it("summarises each row in the accessible data list", () => {
    const wrapper = mount(StatusHistoryChart, {
      props: {
        label: "P",
        data: [{ series: "API", buckets: [{ at: 0, value: "OK" }, { at: 1, value: "Down" }] }],
      },
    });
    expect(listItems(wrapper.element as HTMLElement)[0]).toBe("API: 0 = OK, 1 = Down");
  });

  it("drops non-finite buckets and unlabeled rows before rendering", () => {
    const wrapper = mount(StatusHistoryChart, {
      props: {
        label: "Filtré",
        data: [
          { series: "", buckets: [{ at: 0, value: "A" }] },
          {
            series: "Ok",
            buckets: [
              { at: Number.NaN, value: "bad" },
              { at: 1, value: "good" },
            ],
          },
        ],
      },
    });
    expect((wrapper.element as HTMLElement).querySelectorAll(".st-statusHistoryChart__cell").length).toBe(1);
  });
});
