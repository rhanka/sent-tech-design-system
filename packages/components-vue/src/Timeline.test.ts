import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { Timeline } from "./Timeline.js";
import type { TimelineItem } from "./Timeline.js";

const items: TimelineItem[] = [
  { title: "Dossier créé", meta: "12 mai 2026", description: "Ouverture", tone: "info" },
  { title: "Documents reçus", meta: "14 mai 2026", tone: "success" },
  { title: "Refusé", meta: "20 mai 2026", tone: "danger" },
];

describe("Timeline", () => {
  it("renders one <li> per item inside an <ol>", () => {
    const wrapper = mount(Timeline, { props: { items } });
    const el = wrapper.element as HTMLElement;
    expect(el.matches("ol.st-timeline")).toBe(true);
    expect(el.querySelectorAll("li.st-timeline__item")).toHaveLength(3);
  });

  it("renders title, meta and description text", () => {
    const el = mount(Timeline, { props: { items } }).element as HTMLElement;
    expect(el.querySelector(".st-timeline__title")?.textContent).toBe("Dossier créé");
    expect(el.querySelector(".st-timeline__meta")?.textContent).toBe("12 mai 2026");
    expect(el.querySelector(".st-timeline__description")?.textContent).toBe("Ouverture");
  });

  it("omits meta and description when not provided", () => {
    const el = mount(Timeline, { props: { items: [{ title: "Seul" }] } }).element as HTMLElement;
    expect(el.querySelector(".st-timeline__title")?.textContent).toBe("Seul");
    expect(el.querySelector(".st-timeline__meta")).toBeNull();
    expect(el.querySelector(".st-timeline__description")).toBeNull();
  });

  it("maps the tone onto the item modifier class, defaulting to neutral", () => {
    const el = mount(Timeline, { props: { items } }).element as HTMLElement;
    const lis = el.querySelectorAll("li.st-timeline__item");
    expect(lis[0].classList.contains("st-timeline__item--info")).toBe(true);
    expect(lis[1].classList.contains("st-timeline__item--success")).toBe(true);
    expect(lis[2].classList.contains("st-timeline__item--danger")).toBe(true);

    const plain = mount(Timeline, { props: { items: [{ title: "X" }] } }).element as HTMLElement;
    expect(
      plain.querySelector("li.st-timeline__item")?.classList.contains("st-timeline__item--neutral"),
    ).toBe(true);
  });

  it("reflects the orientation on the root and defaults to vertical", () => {
    const vert = mount(Timeline, { props: { items } }).element as HTMLElement;
    expect(vert.classList.contains("st-timeline--vertical")).toBe(true);

    const horiz = mount(Timeline, { props: { items, orientation: "horizontal" } })
      .element as HTMLElement;
    expect(horiz.classList.contains("st-timeline--horizontal")).toBe(true);
  });

  it("hides the rail from assistive tech", () => {
    const el = mount(Timeline, { props: { items } }).element as HTMLElement;
    expect(el.querySelector(".st-timeline__rail")?.getAttribute("aria-hidden")).toBe("true");
    expect(el.querySelector(".st-timeline__dot")).toBeTruthy();
  });
});
