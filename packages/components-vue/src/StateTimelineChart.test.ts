import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { StateTimelineChart } from "./StateTimelineChart.js";

const services = [
  {
    series: "API",
    segments: [
      { start: 0, end: 6, state: "OK", tone: "success" as const },
      { start: 6, end: 9, state: "Degraded", tone: "warning" as const },
      { start: 9, end: 24, state: "OK", tone: "success" as const },
    ],
  },
  {
    series: "DB",
    segments: [
      { start: 0, end: 14, state: "OK", tone: "success" as const },
      { start: 14, end: 17, state: "Down", tone: "error" as const },
      { start: 17, end: 24, state: "OK", tone: "success" as const },
    ],
  },
];

const listItems = (el: HTMLElement) =>
  Array.from(el.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("StateTimelineChart", () => {
  it("renders one contiguous segment per state, across all lanes", () => {
    const wrapper = mount(StateTimelineChart, { props: { label: "Disponibilité", data: services } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector('[role="img"]')).toBeTruthy();
    expect(el.querySelectorAll(".st-stateTimelineChart__segment").length).toBe(6);
  });

  it("colours segments by explicit tone and renders a state legend", () => {
    const wrapper = mount(StateTimelineChart, { props: { label: "Disponibilité", data: services } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector(".st-stateTimelineChart__segment--success")).toBeTruthy();
    expect(el.querySelector(".st-stateTimelineChart__segment--warning")).toBeTruthy();
    expect(el.querySelector(".st-stateTimelineChart__segment--error")).toBeTruthy();
    expect(el.querySelectorAll(".st-stateTimelineChart__legendItem").length).toBe(3);
  });

  it("derives a stable categoryN tone per state when no tone is given", () => {
    const wrapper = mount(StateTimelineChart, {
      props: {
        label: "Phases",
        data: [
          {
            series: "Lane",
            segments: [
              { start: 0, end: 5, state: "boot" },
              { start: 5, end: 10, state: "run" },
              { start: 10, end: 15, state: "boot" },
            ],
          },
        ],
      },
    });
    const segments = (wrapper.element as HTMLElement).querySelectorAll(".st-stateTimelineChart__segment");
    expect(segments[0].classList.contains("st-stateTimelineChart__segment--category1")).toBe(true);
    expect(segments[1].classList.contains("st-stateTimelineChart__segment--category2")).toBe(true);
    expect(segments[2].classList.contains("st-stateTimelineChart__segment--category1")).toBe(true);
  });

  it("offsets each segment by its start (x0 = start, width = end - start)", () => {
    const wrapper = mount(StateTimelineChart, { props: { label: "P", data: services } });
    const segments = (wrapper.element as HTMLElement).querySelectorAll<SVGRectElement>(".st-stateTimelineChart__segment");
    const x0 = Number(segments[0].getAttribute("x"));
    const x1 = Number(segments[1].getAttribute("x"));
    const w0 = Number(segments[0].getAttribute("width"));
    const w2 = Number(segments[2].getAttribute("width"));
    expect(x1).toBeGreaterThan(x0);
    expect(w2).toBeGreaterThan(w0);
  });

  it("normalises start > end and summarises the lane in the accessible list", () => {
    const wrapper = mount(StateTimelineChart, {
      props: {
        label: "P",
        data: [{ series: "Inversée", segments: [{ start: 9, end: 4, state: "X" }] }],
      },
    });
    expect(listItems(wrapper.element as HTMLElement)[0]).toBe("Inversée: X [4 → 9]");
  });

  it("drops non-finite segments and unlabeled lanes before rendering", () => {
    const wrapper = mount(StateTimelineChart, {
      props: {
        label: "Filtré",
        data: [
          { series: "", segments: [{ start: 1, end: 2, state: "A" }] },
          {
            series: "Ok",
            segments: [
              { start: Number.NaN, end: 5, state: "bad" },
              { start: 2, end: 6, state: "good" },
            ],
          },
        ],
      },
    });
    expect((wrapper.element as HTMLElement).querySelectorAll(".st-stateTimelineChart__segment").length).toBe(1);
  });
});
