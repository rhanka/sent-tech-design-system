import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { TimelineChart } from "./TimelineChart.js";

const events = [
  { position: 2018, label: "Fondation" },
  { position: 2020, label: "Série A", description: "Levée de 5 M$" },
  { position: 2022, label: "Expansion EU" },
  { position: 2024, label: "Série B" },
];

const listItems = (el: HTMLElement) =>
  Array.from(el.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("TimelineChart", () => {
  it("renders one marker per event", () => {
    const wrapper = mount(TimelineChart, { props: { label: "Histoire", data: events } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-timelineChart__marker").length).toBe(events.length);
    expect(el.querySelectorAll(".st-timelineChart__connector").length).toBe(events.length);
  });

  it("alternates categorical tones across markers", () => {
    const wrapper = mount(TimelineChart, { props: { label: "Histoire", data: events } });
    const markers = (wrapper.element as HTMLElement).querySelectorAll(".st-timelineChart__marker");
    expect(markers[0].classList.contains("st-timelineChart__marker--category1")).toBe(true);
    expect(markers[1].classList.contains("st-timelineChart__marker--category2")).toBe(true);
    expect(markers[2].classList.contains("st-timelineChart__marker--category3")).toBe(true);
  });

  it("sorts events by position before rendering", () => {
    const wrapper = mount(TimelineChart, {
      props: {
        label: "Histoire",
        data: [
          { position: 2024, label: "Tard" },
          { position: 2018, label: "Tôt" },
        ],
      },
    });
    const items = listItems(wrapper.element as HTMLElement);
    expect(items[0]).toBe("2018: Tôt");
    expect(items[1]).toBe("2024: Tard");
  });

  it("drops events with non-finite positions", () => {
    const wrapper = mount(TimelineChart, {
      props: {
        label: "Filtré",
        data: [
          { position: Number.NaN, label: "Invalide" },
          { position: 2020, label: "Valide" },
        ],
      },
    });
    expect((wrapper.element as HTMLElement).querySelectorAll(".st-timelineChart__marker").length).toBe(1);
  });

  it("surfaces description in the accessible list", () => {
    const wrapper = mount(TimelineChart, { props: { label: "Histoire", data: events } });
    const items = listItems(wrapper.element as HTMLElement);
    expect(items.length).toBe(events.length);
    expect(items[1]).toBe("2020: Série A — Levée de 5 M$");
  });

  it("respects an explicit tone override", () => {
    const wrapper = mount(TimelineChart, {
      props: { label: "Histoire", data: [{ position: 2018, label: "Fondation", tone: "category5" }] },
    });
    const marker = (wrapper.element as HTMLElement).querySelector(".st-timelineChart__marker");
    expect(marker?.classList.contains("st-timelineChart__marker--category5")).toBe(true);
  });
});
