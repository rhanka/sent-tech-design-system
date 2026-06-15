import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import Timeline from "./lib/Timeline.svelte";
import type { TimelineItem } from "./lib/Timeline.svelte";

const items: TimelineItem[] = [
  { title: "Dossier créé", meta: "12 mai 2026", description: "Ouverture", tone: "info" },
  { title: "Documents reçus", meta: "14 mai 2026", tone: "success" },
  { title: "Refusé", meta: "20 mai 2026", tone: "danger" }
];

describe("Timeline", () => {
  it("renders one <li> per item inside an <ol>", () => {
    const { container } = render(Timeline, { props: { items } });
    expect(container.querySelector("ol.st-timeline")).toBeTruthy();
    expect(container.querySelectorAll("li.st-timeline__item")).toHaveLength(3);
  });

  it("renders title, meta and description text", () => {
    const { container } = render(Timeline, { props: { items } });
    expect(container.querySelector(".st-timeline__title")?.textContent).toBe("Dossier créé");
    expect(container.querySelector(".st-timeline__meta")?.textContent).toBe("12 mai 2026");
    expect(container.querySelector(".st-timeline__description")?.textContent).toBe("Ouverture");
  });

  it("omits meta and description when not provided", () => {
    const { container } = render(Timeline, { props: { items: [{ title: "Seul" }] } });
    expect(container.querySelector(".st-timeline__title")?.textContent).toBe("Seul");
    expect(container.querySelector(".st-timeline__meta")).toBeNull();
    expect(container.querySelector(".st-timeline__description")).toBeNull();
  });

  it("maps the tone onto the item modifier class, defaulting to neutral", () => {
    const { container } = render(Timeline, { props: { items } });
    const lis = container.querySelectorAll("li.st-timeline__item");
    expect(lis[0].classList.contains("st-timeline__item--info")).toBe(true);
    expect(lis[1].classList.contains("st-timeline__item--success")).toBe(true);
    expect(lis[2].classList.contains("st-timeline__item--danger")).toBe(true);

    const { container: plain } = render(Timeline, { props: { items: [{ title: "X" }] } });
    expect(
      plain.querySelector("li.st-timeline__item")?.classList.contains("st-timeline__item--neutral")
    ).toBe(true);
  });

  it("reflects the orientation on the root and defaults to vertical", () => {
    const { container: vert } = render(Timeline, { props: { items } });
    expect(vert.querySelector(".st-timeline--vertical")).toBeTruthy();

    const { container: horiz } = render(Timeline, {
      props: { items, orientation: "horizontal" }
    });
    expect(horiz.querySelector(".st-timeline--horizontal")).toBeTruthy();
  });

  it("hides the dot from assistive tech and keeps the rail aria-hidden", () => {
    const { container } = render(Timeline, { props: { items } });
    const rail = container.querySelector(".st-timeline__rail");
    expect(rail?.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelector(".st-timeline__dot")).toBeTruthy();
  });
});
